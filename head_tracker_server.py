#!/usr/bin/env python3
"""
head_tracker_server.py

OpenCV + MediaPipe face-tracking WebSocket server that computes a normalized
yaw/pitch from webcam face landmarks and broadcasts them as JSON to connected clients.

Compatibility note:
- Works with recent websockets library versions (handler accepts single-arg).
- Robust to different protocol object implementations: avoids accessing
  attributes like .open that may not exist on all versions (ServerConnection).
"""
import asyncio
import json
import time
import math
from typing import Set, Any

import cv2
import numpy as np
import mediapipe as mp
import websockets
from websockets.legacy.server import WebSocketServerProtocol

# Config
WS_HOST = "0.0.0.0"
WS_PORT = 8765
MAX_YAW_DEG = 30.0     # left/right max in degrees
MAX_PITCH_DEG = 20.0   # up/down max in degrees
SMOOTHING = 0.12       # exponential smoothing factor 0..1
SEND_FPS = 25.0        # target send framerate

# Derived constants
MAX_YAW = math.radians(MAX_YAW_DEG)
MAX_PITCH = math.radians(MAX_PITCH_DEG)
FRAME_DELAY = 1.0 / SEND_FPS

clients: Set[WebSocketServerProtocol] = set()


async def ws_handler(ws):
    """
    WebSocket handler: registers the client and keeps the connection alive.

    NOTE: websockets library expects a single-argument handler:
      async def handler(websocket: WebSocketServerProtocol)

    If you need the HTTP request path, read it from websocket.path
    """
    addr = getattr(ws, "remote_address", None)
    print(f"[ws] client connected: {addr} path={getattr(ws, 'path', None)}")
    clients.add(ws)
    try:
        await ws.wait_closed()
    finally:
        clients.discard(ws)
        print(f"[ws] client disconnected: {addr}")


async def _safe_send(c: Any, msg: str):
    """
    Send msg to a single client, removing it from clients set on error.
    This helper avoids relying on protocol attributes that may not exist
    across different websockets versions (like .open).
    """
    try:
        # c may be a WebSocketServerProtocol or other server connection object,
        # but it should implement an async send() method.
        await c.send(msg)
    except Exception:
        # Remove any problematic/disconnected client so future broadcasts are cleaner
        try:
            clients.discard(c)
        except Exception:
            pass


async def broadcast(msg: str):
    """
    Broadcast a message to all connected clients.

    Implementation:
    - We no longer access protocol-specific attributes like `.open` to avoid
      attribute errors on mixed websockets versions.
    - Instead we attempt to send to all clients concurrently and remove clients
      that raise exceptions.
    """
    if not clients:
        return

    # Create a list of coroutines; each safe_send handles its own errors and
    # removes clients if sending fails.
    coros = [_safe_send(c, msg) for c in list(clients)]
    if not coros:
        return
    await asyncio.gather(*coros, return_exceptions=True)


async def capture_loop():
    """
    Capture frames from the default webcam, run FaceMesh, compute yaw/pitch,
    smooth them and broadcast to clients.
    """
    mp_face = mp.solutions.face_mesh  # type: ignore[attr-defined]
    face_mesh = mp_face.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[error] Could not open webcam (index 0).")
        return

    ema_yaw = 0.0
    ema_pitch = 0.0
    last_send = 0.0

    print("[capture] started, broadcasting to WebSocket clients on "
          f"{WS_HOST}:{WS_PORT} ... (MAX_YAW={MAX_YAW_DEG}°, MAX_PITCH={MAX_PITCH_DEG}°)")

    try:
        while True:
            t0 = time.time()
            ret, frame = cap.read()
            if not ret:
                await asyncio.sleep(0.05)
                continue

            # Convert BGR -> RGB
            img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img.flags.writeable = False
            results = face_mesh.process(img)
            img.flags.writeable = True

            if results.multi_face_landmarks:
                lm = results.multi_face_landmarks[0].landmark

                # Use an average of a few nose-center / bridge points for stability:
                idxs = [1, 4, 0, 168]
                xs, ys = [], []
                for i in idxs:
                    if i < len(lm):
                        xs.append(lm[i].x)
                        ys.append(lm[i].y)
                if xs and ys:
                    nx = float(np.mean(xs))  # normalized 0..1, left->right
                    ny = float(np.mean(ys))  # normalized 0..1, top->bottom

                    # dx, dy in range approximately [-1..1], center=0
                    dx = (nx - 0.5) * 2.0
                    dy = (ny - 0.5) * 2.0

                    # Map to yaw/pitch: dx positive -> yaw positive (turn head right => camera yaw right)
                    target_yaw = dx * MAX_YAW
                    # dy positive (nose below center) -> look down; positive pitch goes downwards
                    target_pitch = dy * MAX_PITCH

                    # Smooth
                    ema_yaw = ema_yaw + (target_yaw - ema_yaw) * SMOOTHING
                    ema_pitch = ema_pitch + (target_pitch - ema_pitch) * SMOOTHING

                    payload = {
                        "yaw": ema_yaw,          # radians
                        "pitch": ema_pitch,      # radians
                        "ts": time.time()
                    }
                    now = time.time()
                    if now - last_send >= FRAME_DELAY:
                        msg = json.dumps(payload)
                        await broadcast(msg)
                        last_send = now

            # throttle loop to target FPS (small sleep)
            t1 = time.time()
            elapsed = t1 - t0
            to_sleep = max(0.0, FRAME_DELAY - elapsed)
            await asyncio.sleep(to_sleep)
    except asyncio.CancelledError:
        # normal shutdown
        pass
    except Exception as e:
        print("[capture] exception:", e)
    finally:
        face_mesh.close()
        cap.release()
        print("[capture] stopped.")


async def main():
    # Newer websockets versions expect a handler with signature (websocket)
    server = await websockets.serve(ws_handler, WS_HOST, WS_PORT)
    print(f"[ws] WebSocket server listening at ws://{WS_HOST}:{WS_PORT}")

    # run capture loop concurrently so both server and capture loop run
    capture_task = asyncio.create_task(capture_loop())

    try:
        # wait until capture_loop exits (it normally runs forever)
        await capture_task
    except KeyboardInterrupt:
        print("Interrupted, shutting down.")
    finally:
        # close server and cancel capture loop if still running
        server.close()
        await server.wait_closed()
        if not capture_task.done():
            capture_task.cancel()
            try:
                await capture_task
            except asyncio.CancelledError:
                pass
        print("Server and capture loop stopped.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Interrupted, exiting.")