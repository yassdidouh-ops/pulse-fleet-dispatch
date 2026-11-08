#!/usr/bin/env python3
"""
Pulse Dispatch CAD - Cinematic 30-Second Showcase Video Generator
Resolution: 1280x720 @ 24 fps (720 frames total)
Aesthetic: Luxury "Gris Roi" / Deep Graphite with Emerald/Cyan HUD accents.
6 Chapters x 5 seconds each:
  0s - 5s:   PULSE FLEET DISPATCH - AEROSPATIALE CAD
  5s - 10s:  POWER #1: LIVE OBD-II TELEMETRY & CAN-BUS
  10s - 15s: POWER #2: DYNAMIC WAZE TRAFFIC & SMART REROUTING
  15s - 20s: POWER #3: MOBILE DRIVER COCKPIT & INSTANT ACK
  20s - 25s: POWER #4: TAX-COMPLIANT FISCAL RECEIPT ENGINE (MEV)
  25s - 30s: POWER #5: HORMOZI $100M FLEET ROI: +204% VELOCITY - 0% DEADHEAD
"""

import math
import os
import sys
import time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

# Video parameters
WIDTH = 1280
HEIGHT = 720
FPS = 24
DURATION_SEC = 30
TOTAL_FRAMES = FPS * DURATION_SEC  # 720 frames
OUTPUT_PATH = "/Users/yasserdh/.gemini/antigravity/scratch/pulse-fleet-dispatch/frontend/pulse_dispatch_30s_showcase.mp4"

# Color Palette (Luxury Gris Roi & Cyber Emerald/Cyan)
COLOR_BG_DARK = (10, 14, 20)
COLOR_BG_SURFACE = (18, 24, 34)
COLOR_BG_CARD = (22, 30, 44)
COLOR_BORDER = (38, 50, 70)
COLOR_EMERALD = (16, 185, 129)
COLOR_EMERALD_GLOW = (52, 211, 153)
COLOR_CYAN = (6, 182, 212)
COLOR_CYAN_LIGHT = (103, 232, 249)
COLOR_AMBER = (245, 158, 11)
COLOR_RED = (239, 68, 68)
COLOR_TEXT_WHITE = (248, 250, 252)
COLOR_TEXT_MUTED = (148, 163, 184)
COLOR_TEXT_DIM = (100, 116, 139)

# Load fonts safely
def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

FONT_TITLE = get_font('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 28)
FONT_SUBTITLE = get_font('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 20)
FONT_HEADING = get_font('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
FONT_BODY = get_font('/System/Library/Fonts/Helvetica.ttc', 14)
FONT_BODY_SM = get_font('/System/Library/Fonts/Helvetica.ttc', 12)
FONT_MONO = get_font('/System/Library/Fonts/Menlo.ttc', 13)
FONT_MONO_SM = get_font('/System/Library/Fonts/Menlo.ttc', 11)
FONT_MONO_XS = get_font('/System/Library/Fonts/Menlo.ttc', 9)
FONT_BIG_NUM = get_font('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 44)
FONT_HERO_NUM = get_font('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 56)

def draw_header(draw, chapter_idx, chapter_title, sub_badge, t):
    """Draws top HUD status bar"""
    # Background strip
    draw.rectangle([0, 0, WIDTH, 54], fill=(13, 18, 26))
    draw.line([0, 54, WIDTH, 54], fill=COLOR_BORDER, width=1)

    # Left: Brand / System badge
    # Pulsing live dot
    pulse = 0.5 + 0.5 * math.sin(t * 8.0)
    dot_color = (int(16 + pulse * 36), int(185 + pulse * 40), int(129 + pulse * 30))
    draw.ellipse([24, 18, 38, 32], fill=dot_color)
    draw.text((46, 18), "PULSE DISPATCH OS", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)
    draw.text((215, 20), "v2.4 CAD", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # Center: Chapter Badge
    ch_text = f"CHAPTER 0{chapter_idx + 1} // {chapter_title}"
    bbox = draw.textbbox((0, 0), ch_text, font=FONT_HEADING)
    w_text = bbox[2] - bbox[0]
    cx = WIDTH // 2
    draw.rounded_rectangle([cx - w_text//2 - 16, 12, cx + w_text//2 + 16, 42], radius=6, fill=(20, 29, 42), outline=COLOR_CYAN, width=1)
    draw.text((cx - w_text//2, 18), ch_text, fill=COLOR_CYAN_LIGHT, font=FONT_HEADING)

    # Right: Encrypted Telemetry & Live Clock
    clock_str = f"2026-11-08 14:32:{int(t*2)%60:02d} UTC"
    draw.text((WIDTH - 300, 12), clock_str, fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)
    draw.text((WIDTH - 300, 28), "AES-256 ENCRYPTED // P2P LIVE", fill=COLOR_EMERALD, font=FONT_MONO_XS)

def draw_footer(draw, frame_idx, total_frames, t):
    """Draws bottom running timeline, progress bar, chapter ticks, audio telemetry waveform"""
    y_base = 665
    draw.rectangle([0, y_base, WIDTH, HEIGHT], fill=(13, 18, 26))
    draw.line([0, y_base, WIDTH, y_base], fill=COLOR_BORDER, width=1)

    # Progress bar line
    bar_y = y_base + 12
    draw.rectangle([20, bar_y, WIDTH - 20, bar_y + 4], fill=(24, 32, 46))
    prog = frame_idx / float(total_frames)
    fill_w = int(20 + prog * (WIDTH - 40))
    if fill_w > 20:
        draw.rectangle([20, bar_y, fill_w, bar_y + 4], fill=COLOR_EMERALD)

    # Chapter tick marks and labels
    chapters = ["01 CORE CAD", "02 OBD-II CAN", "03 WAZE GIS", "04 MOBILE ACK", "05 MEV FISCAL", "06 $100M ROI"]
    for i, ch_name in enumerate(chapters):
        tx = 20 + int(i * (WIDTH - 40) / 6.0)
        is_active = (i == frame_idx // 120)
        col = COLOR_EMERALD if is_active else COLOR_TEXT_DIM
        draw.line([tx, bar_y - 3, tx, bar_y + 7], fill=col, width=2)
        draw.text((tx + 4, bar_y + 9), ch_name, fill=col, font=FONT_MONO_XS)

    # Telemetry waveform on the right (audio-visual styled dynamic bars)
    for b in range(28):
        bx = WIDTH - 240 + b * 7
        h_bar = int(4 + 14 * math.sin(t * 12.0 + b * 0.45) * math.cos(t * 7.0 - b * 0.2))
        h_bar = max(3, min(24, abs(h_bar)))
        b_color = COLOR_CYAN if b % 2 == 0 else COLOR_EMERALD
        draw.line([bx, y_base + 44, bx, y_base + 44 - h_bar], fill=b_color, width=3)

    # Running fleet ticker
    ticker = f">> FLEET: 12/12 ACTIVE | DISPATCH LATENCY: 1.2s | DEADHEAD: 0.0% | QUEBEC MEV: SYNCED | GPS: 100% ONLINE <<"
    draw.text((24, y_base + 32), ticker, fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

def draw_cyber_grid(draw, w, h, t):
    """Draws subtle background grid with laser scanline"""
    step = 50
    # Horizontal grid lines
    for y in range(60, h - 55, step):
        draw.line([0, y, w, y], fill=(16, 22, 32), width=1)
    # Vertical grid lines
    for x in range(0, w, step):
        draw.line([x, 60, x, h - 55], fill=(16, 22, 32), width=1)

    # Moving horizontal laser scan beam
    scan_y = int(60 + ((t * 80) % (h - 120)))
    draw.line([0, scan_y, w, scan_y], fill=(6, 182, 212, 60), width=1)

# ================= CHAPTER RENDERERS =================

def render_chapter_1(draw, frame_idx, t):
    """0s - 5s: PULSE FLEET DISPATCH - AEROSPATIALE CAD (System Initialization, 12 active units, Royal Grey UI)"""
    draw_header(draw, 0, "SYSTEM INITIALIZATION & FLEET OVERVIEW", "CAD-CORE", t)

    # Title area
    draw.text((50, 72), "PULSE FLEET DISPATCH", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((430, 78), "// AEROSPATIALE HIGH-VELOCITY CAD", fill=COLOR_CYAN, font=FONT_HEADING)
    draw.text((50, 108), "MISSION CONTROL PLATFORM • 12 ACTIVE MULTI-MODAL UNITS • ZERO LATENCY BUS", fill=COLOR_TEXT_MUTED, font=FONT_BODY)

    # Left Section: Central Tactical Radar & Init Log (x = 50 to 520)
    radar_cx, radar_cy = 285, 360
    # Concentric rings
    for r in [60, 110, 160, 200]:
        draw.ellipse([radar_cx - r, radar_cy - r, radar_cx + r, radar_cy + r], outline=(30, 42, 60), width=1)

    # Crosshairs
    draw.line([radar_cx - 210, radar_cy, radar_cx + 210, radar_cy], fill=(30, 42, 60), width=1)
    draw.line([radar_cx, radar_cy - 210, radar_cx, radar_cy + 210], fill=(30, 42, 60), width=1)

    # Rotating radar sweep arm
    angle = (t * 2.5) % (2 * math.pi)
    arm_x = radar_cx + 200 * math.cos(angle)
    arm_y = radar_cy + 200 * math.sin(angle)
    draw.line([radar_cx, radar_cy, arm_x, arm_y], fill=COLOR_EMERALD, width=2)

    # Central Radar Reticle
    draw.ellipse([radar_cx - 18, radar_cy - 18, radar_cx + 18, radar_cy + 18], fill=(16, 26, 38), outline=COLOR_EMERALD, width=2)
    draw.text((radar_cx - 12, radar_cy - 6), "HQ", fill=COLOR_EMERALD_GLOW, font=FONT_MONO_XS)

    # 12 Fleet Units on Radar (blips around HQ)
    for i in range(12):
        u_ang = i * (2 * math.pi / 12) + 0.2 * math.sin(t + i)
        u_dist = 70 + (i % 4) * 35
        bx = radar_cx + u_dist * math.cos(u_ang)
        by = radar_cy + u_dist * math.sin(u_ang)
        # Check if radar beam just crossed this blip for a glow effect
        diff = (angle - u_ang) % (2 * math.pi)
        glow = math.exp(-diff * 2.0) if diff < 1.0 else 0.1
        b_col = COLOR_EMERALD if i != 3 else COLOR_AMBER
        draw.ellipse([bx - 5, by - 5, bx + 5, by + 5], fill=b_col)
        draw.text((bx + 8, by - 5), f"U-{101+i}", fill=COLOR_TEXT_WHITE if glow > 0.4 else COLOR_TEXT_MUTED, font=FONT_MONO_XS)

    # System status below radar
    draw.rounded_rectangle([60, 580, 510, 640], radius=6, fill=(18, 25, 36), outline=COLOR_BORDER, width=1)
    draw.text((75, 590), "CAD TELEMETRY ENCLAVE:", fill=COLOR_CYAN, font=FONT_HEADING)
    draw.text((75, 612), f"WEBSOCKET PING: 18ms | PACKETS: 4,819/s | THREADS: 16 POOL | ENCRYPTION: ACTIVE", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # Right Section: 12 Active Fleet Units Matrix (x = 550 to 1230, y = 145 to 640)
    units_data = [
        ("UNIT-101", "PRIUS PRIME", "M. Tremblay", "READY", COLOR_EMERALD),
        ("UNIT-102", "CAMRY HYBRID", "J. Bouchard", "EN ROUTE", COLOR_CYAN),
        ("UNIT-103", "SIENNA AWD", "A. Roy", "ON SCENE", COLOR_AMBER),
        ("UNIT-104", "TESLA MODEL 3", "P. Gauthier", "DISPATCHED", COLOR_EMERALD_GLOW),
        ("UNIT-105", "FORD TRANSIT", "E. Morin", "READY", COLOR_EMERALD),
        ("UNIT-106", "COROLLA HYB", "S. Belanger", "EN ROUTE", COLOR_CYAN),
        ("UNIT-107", "RAV4 PRIME", "L. Cote", "READY", COLOR_EMERALD),
        ("UNIT-108", "PRIUS PRIME", "D. Fortin", "ON SCENE", COLOR_AMBER),
        ("UNIT-109", "HYUNDAI IONIQ", "F. Gagnon", "EN ROUTE", COLOR_CYAN),
        ("UNIT-110", "CAMRY HYBRID", "V. Cloutier", "READY", COLOR_EMERALD),
        ("UNIT-111", "SIENNA AWD", "H. Simard", "READY", COLOR_EMERALD),
        ("UNIT-112", "SUBARU OUTBACK", "C. Lavoie", "DISPATCHED", COLOR_EMERALD_GLOW),
    ]

    # Draw 2 columns of 6 units
    for idx, (uname, ucar, udriver, ustatus, ucol) in enumerate(units_data):
        col = idx // 6
        row = idx % 6
        ux = 550 + col * 345
        uy = 145 + row * 82

        # Card container
        draw.rounded_rectangle([ux, uy, ux + 330, uy + 74], radius=6, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=1)

        # Unit name and status pill
        draw.text((ux + 14, uy + 10), uname, fill=COLOR_TEXT_WHITE, font=FONT_HEADING)
        draw.text((ux + 105, uy + 12), ucar, fill=COLOR_TEXT_DIM, font=FONT_MONO_XS)

        # Status pill
        pill_w = 80
        draw.rounded_rectangle([ux + 235, uy + 10, ux + 315, uy + 28], radius=4, fill=(15, 22, 32), outline=ucol, width=1)
        draw.text((ux + 242, uy + 12), ustatus, fill=ucol, font=FONT_MONO_XS)

        # Driver name and metrics
        draw.text((ux + 14, uy + 34), f"Chauffeur: {udriver}", fill=COLOR_TEXT_MUTED, font=FONT_BODY_SM)
        draw.text((ux + 14, uy + 52), f"Signal: 5G 99%  |  Batt: 98%  |  GPS: Locked", fill=COLOR_TEXT_DIM, font=FONT_MONO_XS)

def render_chapter_2(draw, frame_idx, t):
    """5s - 10s: POWER #1: LIVE OBD-II TELEMETRY & CAN-BUS (Speed gauge 108 km/h, RPM 3,450, Fuel level, Coolant)"""
    draw_header(draw, 1, "POWER #1: LIVE OBD-II TELEMETRY & CAN-BUS", "TELEMETRY", t)

    draw.text((50, 72), "LIVE CAN-BUS & OBD-II TELEMETRY STREAM", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((700, 78), "// HIGH-FREQUENCY VEHICLE BUS HARNESS", fill=COLOR_CYAN, font=FONT_HEADING)

    # Dial 1: Speedometer (Center at 260, 360)
    cx, cy, radius = 260, 350, 140
    # Background circular track
    draw.arc([cx - radius, cy - radius, cx + radius, cy + radius], start=135, end=405, fill=(35, 45, 65), width=14)

    # Speed value (animating to 108 with subtle jitter)
    speed_target = 108.0 + 0.6 * math.sin(t * 15.0)
    # 0 to 160 km/h maps to 135 deg to 405 deg (270 deg span)
    speed_deg = 135 + (speed_target / 160.0) * 270.0
    # Active speed arc
    draw.arc([cx - radius, cy - radius, cx + radius, cy + radius], start=135, end=int(speed_deg), fill=COLOR_EMERALD, width=14)

    # Ticks
    for s in range(0, 161, 20):
        t_ang = math.radians(135 + (s / 160.0) * 270.0)
        x1 = cx + (radius - 20) * math.cos(t_ang)
        y1 = cy + (radius - 20) * math.sin(t_ang)
        x2 = cx + (radius - 5) * math.cos(t_ang)
        y2 = cy + (radius - 5) * math.sin(t_ang)
        draw.line([x1, y1, x2, y2], fill=COLOR_TEXT_MUTED, width=2)
        tx = cx + (radius - 35) * math.cos(t_ang) - 8
        ty = cy + (radius - 35) * math.sin(t_ang) - 6
        draw.text((tx, ty), str(s), fill=COLOR_TEXT_DIM, font=FONT_MONO_XS)

    # Speed needle
    needle_rad = math.radians(speed_deg)
    nx = cx + (radius - 25) * math.cos(needle_rad)
    ny = cy + (radius - 25) * math.sin(needle_rad)
    draw.line([cx, cy, nx, ny], fill=COLOR_EMERALD_GLOW, width=4)
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(24, 32, 46), outline=COLOR_EMERALD, width=2)

    # Speed digital readout
    draw.text((cx - 50, cy + 30), f"{int(speed_target)}", fill=COLOR_TEXT_WHITE, font=FONT_HERO_NUM)
    draw.text((cx + 25, cy + 50), "KM/H", fill=COLOR_CYAN, font=FONT_HEADING)
    draw.text((cx - 65, cy + 85), "SPEED SENSOR: ACTIVE", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)

    # Dial 2: Tachometer (Center at 600, 350)
    cx2, cy2 = 600, 350
    draw.arc([cx2 - radius, cy2 - radius, cx2 + radius, cy2 + radius], start=135, end=405, fill=(35, 45, 65), width=14)

    # RPM target: 3,450
    rpm_target = 3450 + int(30 * math.sin(t * 18.0))
    # 0 to 6000 RPM maps to 135 deg to 405 deg
    rpm_deg = 135 + (rpm_target / 6000.0) * 270.0
    # Redline arc (4500 to 6000)
    redline_deg = 135 + (4500 / 6000.0) * 270.0
    draw.arc([cx2 - radius, cy2 - radius, cx2 + radius, cy2 + radius], start=int(redline_deg), end=405, fill=COLOR_RED, width=14)
    draw.arc([cx2 - radius, cy2 - radius, cx2 + radius, cy2 + radius], start=135, end=int(rpm_deg), fill=COLOR_CYAN, width=14)

    # RPM Ticks
    for r in range(0, 7):
        t_ang = math.radians(135 + (r / 6.0) * 270.0)
        x1 = cx2 + (radius - 20) * math.cos(t_ang)
        y1 = cy2 + (radius - 20) * math.sin(t_ang)
        x2 = cx2 + (radius - 5) * math.cos(t_ang)
        y2 = cy2 + (radius - 5) * math.sin(t_ang)
        draw.line([x1, y1, x2, y2], fill=COLOR_TEXT_MUTED, width=2)
        tx = cx2 + (radius - 35) * math.cos(t_ang) - 4
        ty = cy2 + (radius - 35) * math.sin(t_ang) - 6
        draw.text((tx, ty), str(r), fill=COLOR_TEXT_DIM, font=FONT_MONO_XS)

    # RPM needle
    needle_rad2 = math.radians(rpm_deg)
    nx2 = cx2 + (radius - 25) * math.cos(needle_rad2)
    ny2 = cy2 + (radius - 25) * math.sin(needle_rad2)
    draw.line([cx2, cy2, nx2, ny2], fill=COLOR_CYAN_LIGHT, width=4)
    draw.ellipse([cx2 - 10, cy2 - 10, cx2 + 10, cy2 + 10], fill=(24, 32, 46), outline=COLOR_CYAN, width=2)

    # RPM digital readout
    draw.text((cx2 - 70, cy2 + 30), f"{rpm_target:,}", fill=COLOR_TEXT_WHITE, font=FONT_HERO_NUM)
    draw.text((cx2 + 50, cy2 + 50), "RPM", fill=COLOR_CYAN, font=FONT_HEADING)
    draw.text((cx2 - 50, cy2 + 85), "GEAR: D5 [LOCKUP]", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)

    # Right Panel: Live CAN-BUS Diagnostic & Sensor Matrix (x = 810 to 1230)
    draw.rounded_rectangle([810, 120, 1230, 630], radius=8, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=1)
    draw.text((830, 138), "CAN-BUS ARBITRATION MATRIX", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)
    draw.text((830, 158), "INTERFACE: can0 (ISO 15765-4 500k/s)", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # Sensor Gauges
    # Coolant
    draw.text((830, 195), "ENGINE COOLANT TEMP", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)
    draw.text((1150, 195), "91°C", fill=COLOR_EMERALD, font=FONT_MONO_SM)
    draw.rectangle([830, 215, 1210, 225], fill=(30, 40, 56))
    draw.rectangle([830, 215, 830 + int(380 * (91 / 130.0)), 225], fill=COLOR_EMERALD)

    # Fuel Level
    draw.text((830, 245), "FUEL LEVEL (OBD PID 0x2F)", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)
    draw.text((1150, 245), "84%", fill=COLOR_CYAN, font=FONT_MONO_SM)
    draw.rectangle([830, 265, 1210, 275], fill=(30, 40, 56))
    draw.rectangle([830, 265, 830 + int(380 * 0.84), 275], fill=COLOR_CYAN)

    # Battery
    draw.text((830, 295), "ALTERNATOR BUS VOLTAGE", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)
    draw.text((1140, 295), "14.2 V", fill=COLOR_EMERALD, font=FONT_MONO_SM)
    draw.rectangle([830, 315, 1210, 325], fill=(30, 40, 56))
    draw.rectangle([830, 315, 830 + int(380 * (14.2 / 16.0)), 325], fill=COLOR_EMERALD)

    # Live Raw Hex Packets scrolling
    draw.text((830, 355), "LIVE PACKET INTERCEPT (CAN-ID 0x7E8):", fill=COLOR_CYAN_LIGHT, font=FONT_MONO_XS)
    can_packets = [
        "0x7E0  [8]  02 01 0D 00 00 00 00 00  (REQ SPEED)",
        "0x7E8  [8]  03 41 0D 6C 00 00 00 00  (SPD: 108 KM/H)",
        "0x7E0  [8]  02 01 0C 00 00 00 00 00  (REQ RPM)",
        "0x7E8  [8]  04 41 0C 0D 7A 00 00 00  (RPM: 3,450)",
        "0x7E0  [8]  02 01 05 00 00 00 00 00  (REQ COOLANT)",
        "0x7E8  [8]  03 41 05 77 00 00 00 00  (TEMP: 91°C)",
        "0x7E8  [8]  04 41 2F D6 00 00 00 00  (FUEL: 84%)",
    ]
    # Rotate based on frame
    shift = int(t * 8) % len(can_packets)
    for idx in range(6):
        pkt = can_packets[(shift + idx) % len(can_packets)]
        draw.text((830, 380 + idx * 26), pkt, fill=COLOR_TEXT_MUTED if idx > 1 else COLOR_EMERALD_GLOW, font=FONT_MONO_SM)

    # Diagnostic Banner at bottom
    draw.rounded_rectangle([830, 560, 1210, 610], radius=6, fill=(16, 26, 38), outline=COLOR_EMERALD, width=1)
    draw.text((845, 572), "● DTC CHECK: 0 TROUBLE CODES", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)
    draw.text((845, 592), "ALL 12 CAN SENSOR HARNESSES NOMINAL", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)

def render_chapter_3(draw, frame_idx, t):
    """10s - 15s: POWER #2: DYNAMIC WAZE TRAFFIC & SMART REROUTING (Congestion +6m, automatic reroute)"""
    draw_header(draw, 2, "POWER #2: DYNAMIC WAZE TRAFFIC & SMART REROUTING", "GIS-ENGINE", t)

    draw.text((50, 72), "DYNAMIC WAZE TRAFFIC & AUTOMATIC REROUTING", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((720, 78), "// LIVE GIS VECTOR MAPPING ENGINE", fill=COLOR_CYAN, font=FONT_HEADING)

    # Left Section: Tactical Montreal GIS Map (x = 50 to 820, y = 120 to 640)
    map_x1, map_y1, map_x2, map_y2 = 50, 120, 820, 640
    draw.rounded_rectangle([map_x1, map_y1, map_x2, map_y2], radius=8, fill=(12, 17, 26), outline=COLOR_BORDER, width=1)

    # River curve (St. Lawrence River representation)
    river_pts = [
        (map_x1 + 10, map_y2 - 80), (map_x1 + 180, map_y2 - 110),
        (map_x1 + 360, map_y2 - 140), (map_x1 + 540, map_y2 - 200),
        (map_x2 - 10, map_y2 - 270), (map_x2 - 10, map_y2 - 10),
        (map_x1 + 10, map_y2 - 10)
    ]
    draw.polygon(river_pts, fill=(14, 25, 42))
    draw.text((map_x1 + 450, map_y2 - 80), "FLEUVE SAINT-LAURENT", fill=(30, 48, 76), font=FONT_MONO_SM)

    # City Street Grid Network
    for gx in range(map_x1 + 50, map_x2 - 30, 70):
        draw.line([gx, map_y1 + 20, gx, map_y2 - 100], fill=(22, 32, 48), width=1)
    for gy in range(map_y1 + 40, map_y2 - 90, 50):
        draw.line([map_x1 + 20, gy, map_x2 - 20, gy], fill=(22, 32, 48), width=1)

    # Origin and Destination Points
    origin = (map_x1 + 160, map_y1 + 320)       # Downtown
    dest = (map_x2 - 140, map_y1 + 140)         # Airport YUL

    # Primary Congested Route (A-40 East): Struck through with red/amber pulse
    congested_pts = [
        origin,
        (origin[0] + 60, origin[1] - 120),
        (origin[0] + 240, origin[1] - 140),
        (dest[0] - 80, dest[1] - 40),
        dest
    ]
    draw.line(congested_pts, fill=(180, 50, 50), width=4)

    # Flashing Congestion Hazard Marker on blocked route
    pulse = 0.5 + 0.5 * math.sin(t * 12.0)
    hazard_x = origin[0] + 160
    hazard_y = origin[1] - 130
    draw.ellipse([hazard_x - 18, hazard_y - 18, hazard_x + 18, hazard_y + 18], fill=(int(220 * pulse), 40, 40), outline=COLOR_RED, width=2)
    draw.text((hazard_x - 8, hazard_y - 8), "!", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)

    # Congestion Alert Callout
    draw.rounded_rectangle([hazard_x - 10, hazard_y - 50, hazard_x + 190, hazard_y - 15], radius=4, fill=(35, 15, 20), outline=COLOR_RED, width=1)
    draw.text((hazard_x, hazard_y - 45), "CONGESTION: +6.4 MIN DELAY", fill=COLOR_RED, font=FONT_MONO_XS)

    # Smart Alternate Route (Calculated by Pulse Waze Engine): Glowing Emerald Path
    smart_route_pts = [
        origin,
        (origin[0] + 100, origin[1] + 30),
        (origin[0] + 280, origin[1] + 40),
        (origin[0] + 420, origin[1] - 30),
        (dest[0] - 40, dest[1] + 30),
        dest
    ]
    # Draw glowing path
    draw.line(smart_route_pts, fill=(16, 185, 129, 120), width=8)
    draw.line(smart_route_pts, fill=COLOR_EMERALD_GLOW, width=4)

    # Moving Vehicle on the Smart Route
    route_progress = ((t * 0.35) % 1.0)
    # Parametric position along smart_route_pts
    seg_idx = int(route_progress * (len(smart_route_pts) - 1))
    sub_t = (route_progress * (len(smart_route_pts) - 1)) - seg_idx
    p1 = smart_route_pts[seg_idx]
    p2 = smart_route_pts[min(seg_idx + 1, len(smart_route_pts) - 1)]
    car_x = int(p1[0] + sub_t * (p2[0] - p1[0]))
    car_y = int(p1[1] + sub_t * (p2[1] - p1[1]))

    # Car Sonar ripple rings
    r_ripple = int(12 + 18 * ((t * 3.0) % 1.0))
    draw.ellipse([car_x - r_ripple, car_y - r_ripple, car_x + r_ripple, car_y + r_ripple], outline=COLOR_CYAN, width=1)
    # Vehicle Marker
    draw.ellipse([car_x - 8, car_y - 8, car_x + 8, car_y + 8], fill=COLOR_EMERALD_GLOW, outline=COLOR_TEXT_WHITE, width=2)
    draw.text((car_x + 12, car_y - 8), "UNIT-104 (78 km/h)", fill=COLOR_TEXT_WHITE, font=FONT_MONO_XS)

    # Origin & Dest Badges
    draw.rounded_rectangle([origin[0] - 40, origin[1] + 15, origin[0] + 80, origin[1] + 35], radius=4, fill=COLOR_BG_CARD, outline=COLOR_CYAN, width=1)
    draw.text((origin[0] - 32, origin[1] + 18), "DOWNTOWN HQ", fill=COLOR_CYAN_LIGHT, font=FONT_MONO_XS)

    draw.rounded_rectangle([dest[0] - 20, dest[1] - 35, dest[0] + 110, dest[1] - 15], radius=4, fill=COLOR_BG_CARD, outline=COLOR_EMERALD, width=1)
    draw.text((dest[0] - 12, dest[1] - 32), "AEROPORT YUL", fill=COLOR_EMERALD_GLOW, font=FONT_MONO_XS)

    # Right Section: Real-Time Rerouting Decision Engine (x = 845 to 1230)
    draw.rounded_rectangle([845, 120, 1230, 640], radius=8, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=1)
    draw.text((865, 138), "ALGORITHMIC ROUTE ARBITRATION", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)
    draw.text((865, 158), "WAZE LIVE GIS PROTOCOL // INCIDENT AVOIDANCE", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # Option 1: Legacy Highway 40
    draw.rounded_rectangle([865, 195, 1210, 285], radius=6, fill=(28, 20, 24), outline=(100, 30, 40), width=1)
    draw.text((880, 206), "ROUTE A: AUTOROUTE 40 EST", fill=COLOR_TEXT_MUTED, font=FONT_HEADING)
    draw.text((880, 230), "ESTIMATED TIME: 28 MIN (+6.4m TRAFFIC)", fill=COLOR_RED, font=FONT_MONO_SM)
    draw.text((880, 255), "STATUS: REJECTED (MAJOR BOTTLENECK)", fill=COLOR_TEXT_DIM, font=FONT_MONO_XS)

    # Option 2: Pulse Smart Reroute (Highlighted!)
    draw.rounded_rectangle([865, 305, 1210, 435], radius=6, fill=(16, 32, 36), outline=COLOR_EMERALD, width=2)
    draw.text((880, 318), "★ PULSE SMART REROUTE (VIA A-20)", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)
    draw.text((880, 345), "ESTIMATED TIME: 21 MIN (-7.2 MIN SAVED)", fill=COLOR_CYAN_LIGHT, font=FONT_BIG_NUM)
    draw.text((880, 405), "AUTOMATIC DISPATCH OVERRIDE EXECUTED", fill=COLOR_EMERALD, font=FONT_MONO_XS)

    # Metric summary box
    draw.rounded_rectangle([865, 455, 1210, 615], radius=6, fill=(15, 22, 32), outline=COLOR_BORDER, width=1)
    draw.text((880, 470), "OPTIMIZATION TELEMETRY:", fill=COLOR_CYAN, font=FONT_HEADING)
    draw.text((880, 498), "• FUEL SAVINGS: ~1.4 LITER / TRIP", fill=COLOR_TEXT_WHITE, font=FONT_BODY)
    draw.text((880, 524), "• PASSENGER DELIGHT: +18.4% CSAT", fill=COLOR_TEXT_WHITE, font=FONT_BODY)
    draw.text((880, 550), "• WAZE RE-INDEX TIME: 0.28 SECONDS", fill=COLOR_TEXT_WHITE, font=FONT_BODY)
    draw.text((880, 580), "LIVE GIS SOCKETS: 12 UNITS SYNCED", fill=COLOR_EMERALD, font=FONT_MONO_SM)

def render_chapter_4(draw, frame_idx, t):
    """15s - 20s: POWER #3: MOBILE DRIVER COCKPIT & INSTANT ACK (1-tap dispatch, 20s auto-ack countdown)"""
    draw_header(draw, 3, "POWER #3: MOBILE DRIVER COCKPIT & INSTANT ACK", "DRIVER-UI", t)

    draw.text((50, 72), "MOBILE DRIVER COCKPIT & 1-TAP DISPATCH ACK", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((710, 78), "// ULTRA-RESPONSIVE MOBILE PWA INTERFACE", fill=COLOR_CYAN, font=FONT_HEADING)

    # Left: Smartphone Frame (x = 100 to 480, y = 115 to 645)
    phone_x1, phone_y1, phone_x2, phone_y2 = 100, 115, 480, 645
    # Outer phone bezel
    draw.rounded_rectangle([phone_x1, phone_y1, phone_x2, phone_y2], radius=28, fill=(15, 20, 28), outline=(60, 75, 100), width=3)
    # Screen inner
    draw.rounded_rectangle([phone_x1 + 10, phone_y1 + 10, phone_x2 - 10, phone_y2 - 10], radius=20, fill=(8, 12, 18))

    # Phone dynamic island / speaker
    draw.rounded_rectangle([phone_x1 + 120, phone_y1 + 16, phone_x2 - 120, phone_y1 + 34], radius=9, fill=(0, 0, 0))
    # Phone status bar
    draw.text((phone_x1 + 25, phone_y1 + 18), "14:32", fill=COLOR_TEXT_WHITE, font=FONT_MONO_SM)
    draw.text((phone_x2 - 80, phone_y1 + 18), "5G  98%", fill=COLOR_TEXT_WHITE, font=FONT_MONO_SM)

    # Phone App Header
    draw.text((phone_x1 + 25, phone_y1 + 48), "PULSE DRIVER OS", fill=COLOR_CYAN, font=FONT_HEADING)
    draw.text((phone_x1 + 25, phone_y1 + 68), "CHAUFFEUR: MARC TREMBLAY (#104)", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)

    # Dispatch Alert Card
    # Simulated tap occurs at frame 410 (around t = 17.1s)
    accepted = (frame_idx >= 410)

    card_bg = (16, 36, 32) if accepted else (32, 22, 28)
    card_border = COLOR_EMERALD if accepted else COLOR_AMBER
    draw.rounded_rectangle([phone_x1 + 20, phone_y1 + 95, phone_x2 - 20, phone_y1 + 345], radius=12, fill=card_bg, outline=card_border, width=2)

    # Dispatch card header
    if not accepted:
        draw.text((phone_x1 + 35, phone_y1 + 110), "🚨 INCOMING PRIORITY DISPATCH", fill=COLOR_AMBER, font=FONT_HEADING)
        draw.text((phone_x1 + 35, phone_y1 + 132), "COURSE #MTL-8842 [VIP CLIENT]", fill=COLOR_TEXT_WHITE, font=FONT_MONO_SM)
    else:
        draw.text((phone_x1 + 35, phone_y1 + 110), "✓ DISPATCH ACCEPTED (0.8s ACK)", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)
        draw.text((phone_x1 + 35, phone_y1 + 132), "UNIT ASSIGNED: YOU ARE EN ROUTE", fill=COLOR_TEXT_WHITE, font=FONT_MONO_SM)

    # Trip info
    draw.text((phone_x1 + 35, phone_y1 + 160), "PICKUP:", fill=COLOR_CYAN, font=FONT_MONO_XS)
    draw.text((phone_x1 + 35, phone_y1 + 175), "Fairmont Le Reine Elizabeth", fill=COLOR_TEXT_WHITE, font=FONT_BODY)
    draw.text((phone_x1 + 35, phone_y1 + 205), "DESTINATION:", fill=COLOR_CYAN, font=FONT_MONO_XS)
    draw.text((phone_x1 + 35, phone_y1 + 220), "Aéroport Montréal-Trudeau (YUL)", fill=COLOR_TEXT_WHITE, font=FONT_BODY)
    draw.text((phone_x1 + 35, phone_y1 + 250), "EST. FARE: $39.50 CAD • 18.2 KM", fill=COLOR_EMERALD, font=FONT_HEADING)

    # Auto-ack circular timer or accept state
    if not accepted:
        # Countdown from 20s to 16s...
        countdown_rem = 20.0 - ((frame_idx - 360) / 24.0) * 4.0
        # Circular countdown ring
        rc_cx, rc_cy = phone_x1 + 190, phone_y1 + 300
        draw.ellipse([rc_cx - 24, rc_cy - 24, rc_cx + 24, rc_cy + 24], outline=(60, 40, 50), width=4)
        arc_prog = (countdown_rem / 20.0) * 360.0
        draw.arc([rc_cx - 24, rc_cy - 24, rc_cx + 24, rc_cy + 24], start=-90, end=int(-90 + arc_prog), fill=COLOR_AMBER, width=4)
        draw.text((rc_cx - 14, rc_cy - 8), f"{int(countdown_rem)}s", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)
        draw.text((phone_x1 + 45, phone_y1 + 292), "AUTO-ACK:", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)
    else:
        draw.text((phone_x1 + 35, phone_y1 + 292), "STATUS: DISPATCH LOCKED // READY", fill=COLOR_EMERALD_GLOW, font=FONT_MONO_SM)

    # 1-Tap Action Button on Phone
    btn_y = phone_y1 + 365
    if not accepted:
        # Pulsing Accept button
        btn_col = COLOR_EMERALD
        draw.rounded_rectangle([phone_x1 + 20, btn_y, phone_x2 - 20, btn_y + 55], radius=10, fill=btn_col)
        draw.text((phone_x1 + 80, btn_y + 16), "⚡ 1-TAP ACCEPT DISPATCH", fill=(0, 0, 0), font=FONT_HEADING)
    else:
        # Action buttons: Open in Waze & Call
        draw.rounded_rectangle([phone_x1 + 20, btn_y, phone_x2 - 20, btn_y + 48], radius=8, fill=(30, 144, 255))
        draw.text((phone_x1 + 65, btn_y + 14), "⮞ LAUNCH WAZE NAVIGATION", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)

        draw.rounded_rectangle([phone_x1 + 20, btn_y + 60, phone_x2 - 20, btn_y + 105], radius=8, fill=(24, 34, 48), outline=COLOR_BORDER, width=1)
        draw.text((phone_x1 + 85, btn_y + 74), "📞 CALL PASSENGER", fill=COLOR_CYAN, font=FONT_HEADING)

    # Simulated tap ripple at transition
    if 405 <= frame_idx <= 420:
        tap_r = (frame_idx - 405) * 4
        tap_cx, tap_cy = phone_x1 + 190, btn_y + 25
        draw.ellipse([tap_cx - tap_r, tap_cy - tap_r, tap_cx + tap_r, tap_cy + tap_r], outline=COLOR_TEXT_WHITE, width=3)

    # Right: Dispatch Command Enclave Telemetry (x = 520 to 1230, y = 115 to 645)
    draw.rounded_rectangle([520, 115, 1230, 645], radius=8, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=1)
    draw.text((545, 138), "DISPATCHER COMMAND AUDIT TRAIL", fill=COLOR_TEXT_WHITE, font=FONT_HEADING)
    draw.text((545, 158), "SOCKET CONNECTION: WSS://PULSE.DISPATCH/LIVE-BUS", fill=COLOR_CYAN, font=FONT_MONO_SM)

    # Timeline audit steps
    audit_steps = [
        ("14:32:01.042", "PASSENGER BOOKING INGESTION", "FAIRMONT TO YUL AIRPORT", COLOR_TEXT_MUTED),
        ("14:32:01.098", "AI GEO-PROXIMITY ENGINE", "UNIT-104 MATCHED (0.8 KM RADIUS)", COLOR_CYAN),
        ("14:32:01.120", "WEBSOCKET BROADCAST SENT", "LATENCY TO DEVICE: 18ms", COLOR_CYAN_LIGHT),
        ("14:32:01.980" if accepted else "14:32:--.---", "1-TAP DRIVER ACKNOWLEDGED", "DISPATCH ACCEPTED IN 0.86s", COLOR_EMERALD_GLOW if accepted else COLOR_TEXT_DIM),
        ("14:32:02.040" if accepted else "14:32:--.---", "WAZE HANDOFF INITIATED", "TURN-BY-TURN SYNCED", COLOR_EMERALD if accepted else COLOR_TEXT_DIM),
    ]

    for idx, (tstamp, event_title, event_desc, ecol) in enumerate(audit_steps):
        sy = 205 + idx * 62
        draw.text((545, sy), tstamp, fill=COLOR_TEXT_DIM, font=FONT_MONO_SM)
        draw.text((665, sy), event_title, fill=ecol, font=FONT_HEADING)
        draw.text((665, sy + 20), event_desc, fill=COLOR_TEXT_MUTED, font=FONT_BODY_SM)
        draw.line([645, sy - 5, 645, sy + 45], fill=COLOR_BORDER, width=2)
        draw.ellipse([641, sy + 5, 649, sy + 13], fill=ecol)

    # Big KPI highlight box at bottom right
    draw.rounded_rectangle([545, 520, 1205, 625], radius=6, fill=(16, 26, 38), outline=COLOR_EMERALD, width=1)
    draw.text((565, 535), "MISSION CONTROL AUDIT: ZERO DISPATCH FRICTION", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)
    draw.text((565, 560), "AVERAGE DRIVER ACCEPTANCE: 1.2 SECONDS", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((565, 595), "99.8% ALLOCATION ACCURACY  |  0 CALL DROP RATE", fill=COLOR_CYAN, font=FONT_MONO_SM)

def render_chapter_5(draw, frame_idx, t):
    """20s - 25s: POWER #4: TAX-COMPLIANT FISCAL RECEIPT ENGINE (MEV / WEB-MEV Quebec)"""
    draw_header(draw, 4, "POWER #4: TAX-COMPLIANT FISCAL RECEIPT ENGINE (MEV)", "FISCAL-CORE", t)

    draw.text((50, 72), "QUEBEC MEV / WEB-MEV TAX COMPLIANCE ENGINE", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((740, 78), "// REVENU QUÉBEC DIGITAL FISCAL ENCLAVE", fill=COLOR_CYAN, font=FONT_HEADING)

    # Left: Revenu Québec Compliance Terminal (x = 50 to 620, y = 120 to 645)
    draw.rounded_rectangle([50, 120, 620, 645], radius=8, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=1)

    # Revenu Quebec header badge
    draw.rounded_rectangle([70, 140, 600, 205], radius=6, fill=(20, 30, 48), outline=COLOR_CYAN, width=1)
    draw.text((85, 150), "REVENU QUÉBEC  •  MODULE D'ENREGISTREMENT DES VENTES", fill=COLOR_CYAN_LIGHT, font=FONT_HEADING)
    draw.text((85, 175), "LOI 17 TAXI CERTIFICATION  |  CERTIFICAT: #QC-2026-99420-MEV", fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)

    # Ledger Verification checklist
    checks = [
        ("CRYPTOGRAPHIC SIGNATURE (SHA-256)", "HASH VERIFIED", COLOR_EMERALD),
        ("TPS (TAXE SUR LES PRODUITS ET SERVICES - 5.0%)", "$1.72 CAD", COLOR_TEXT_WHITE),
        ("TVQ (TAXE DE VENTE DU QUÉBEC - 9.975%)", "$3.43 CAD", COLOR_TEXT_WHITE),
        ("MONTANT TOTAL CERTIFIÉ AU REGISTRE", "$39.50 CAD", COLOR_EMERALD_GLOW),
        ("REVENU QUÉBEC CLOUD HANDSHAKE", "HTTP 200 OK (38ms)", COLOR_EMERALD),
        ("NUMÉRO DE SÉRIE FISCAL ÉLECTRONIQUE", "MEV-9942-8821-FA02", COLOR_CYAN),
    ]

    for idx, (label, val, col) in enumerate(checks):
        cy = 230 + idx * 52
        draw.text((75, cy), label, fill=COLOR_TEXT_MUTED, font=FONT_MONO_XS)
        draw.text((75, cy + 18), f"[✓]  {val}", fill=col, font=FONT_HEADING)

    # Verification Seal Stamp
    draw.rounded_rectangle([70, 545, 600, 625], radius=6, fill=(16, 32, 28), outline=COLOR_EMERALD, width=2)
    draw.text((85, 558), "LEGAL TAX ENCLAVE: 100% AUDIT PROOF", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)
    draw.text((85, 582), "BILL 17 COMPLIANT • TAMPER-RESISTANT FISCAL LEDGER", fill=COLOR_TEXT_MUTED, font=FONT_MONO_SM)

    # Right: Animated Realistic 58mm Thermal Receipt Printing (x = 660 to 1230, y = 120 to 645)
    # Printer slot at top
    draw.rounded_rectangle([700, 115, 1190, 140], radius=4, fill=(40, 50, 65), outline=(70, 85, 110), width=2)
    draw.line([720, 138, 1170, 138], fill=(10, 15, 20), width=4)

    # White Thermal Paper receipt feeding downwards
    # Paper height animates down
    print_progress = min(1.0, (frame_idx - 480) / 90.0)
    receipt_h = int(120 + print_progress * 380)
    rx1, rx2 = 720, 1170
    draw.rectangle([rx1, 140, rx2, 140 + receipt_h], fill=(245, 245, 248))

    # Thermal Receipt Text in crisp black monospace
    draw.text((rx1 + 80, 155), "================================", fill=(20, 20, 20), font=FONT_MONO_SM)
    draw.text((rx1 + 105, 172), "PULSE FLEET DISPATCH INC.", fill=(10, 10, 10), font=FONT_HEADING)
    draw.text((rx1 + 85, 192), "BUREAU DU TAXI DE MONTRÉAL (BTM)", fill=(40, 40, 40), font=FONT_MONO_XS)
    draw.text((rx1 + 80, 208), "================================", fill=(20, 20, 20), font=FONT_MONO_SM)

    if receipt_h > 120:
        draw.text((rx1 + 35, 226), "DATE: 2026-11-08      HEURE: 14:32:15", fill=(30, 30, 30), font=FONT_MONO_XS)
        draw.text((rx1 + 35, 244), "COURSE: #8842         CHAUFFEUR: #104", fill=(30, 30, 30), font=FONT_MONO_XS)
        draw.text((rx1 + 35, 262), "----------------------------------------", fill=(50, 50, 50), font=FONT_MONO_XS)

    if receipt_h > 180:
        draw.text((rx1 + 35, 280), "PRISE EN CHARGE:                 $4.10", fill=(20, 20, 20), font=FONT_MONO_SM)
        draw.text((rx1 + 35, 300), "DISTANCE (18.20 KM):            $30.25", fill=(20, 20, 20), font=FONT_MONO_SM)
        draw.text((rx1 + 35, 320), "ATTENTE (0:00 MIN):              $0.00", fill=(20, 20, 20), font=FONT_MONO_SM)
        draw.text((rx1 + 35, 340), "SOUS-TOTAL:                     $34.35", fill=(20, 20, 20), font=FONT_MONO_SM)
        draw.text((rx1 + 35, 360), "TPS (5.000%):                    $1.72", fill=(20, 20, 20), font=FONT_MONO_SM)
        draw.text((rx1 + 35, 380), "TVQ (9.975%):                    $3.43", fill=(20, 20, 20), font=FONT_MONO_SM)
        draw.text((rx1 + 35, 400), "----------------------------------------", fill=(50, 50, 50), font=FONT_MONO_XS)
        draw.text((rx1 + 35, 418), "TOTAL FACTURÉ:              $39.50 CAD", fill=(0, 0, 0), font=FONT_HEADING)
        draw.text((rx1 + 35, 440), "PAIEMENT: INTERAC SANS CONTACT", fill=(40, 40, 40), font=FONT_MONO_SM)

    # Procedural QR Code & Fiscal Barcode at bottom of receipt
    if receipt_h > 360:
        qr_ox, qr_oy = rx1 + 40, 460
        # Draw 25x25 QR matrix
        np.random.seed(8842)
        grid = np.random.randint(0, 2, size=(21, 21))
        # Add 3 authentic corner finder squares
        for corner in [(0, 0), (0, 14), (14, 0)]:
            r0, c0 = corner
            grid[r0:r0+7, c0:c0+7] = 1
            grid[r0+1:r0+6, c0+1:c0+6] = 0
            grid[r0+2:r0+5, c0+2:c0+5] = 1

        cell_s = 4
        for r in range(21):
            for c in range(21):
                if grid[r, c] == 1:
                    draw.rectangle([qr_ox + c * cell_s, qr_oy + r * cell_s, qr_ox + (c+1)*cell_s, qr_oy + (r+1)*cell_s], fill=(0, 0, 0))

        # QR side text
        draw.text((qr_ox + 105, qr_oy + 10), "MEV ID: 9942-8821-FA02", fill=(0, 0, 0), font=FONT_MONO_XS)
        draw.text((qr_ox + 105, qr_oy + 30), "AUTHENTIFIÉ REVENU QC", fill=(0, 120, 0), font=FONT_MONO_XS)
        draw.text((qr_ox + 105, qr_oy + 50), "SCAN POUR FACTURE PDF", fill=(50, 50, 50), font=FONT_MONO_XS)

        # Barcode at bottom
        for b in range(40):
            bx = rx1 + 35 + b * 10
            bw = 2 if b % 3 == 0 else 4
            draw.line([bx, 560, bx, 585], fill=(0, 0, 0), width=bw)
        draw.text((rx1 + 120, 592), "* QC-MEV-8842-2026 *", fill=(30, 30, 30), font=FONT_MONO_XS)

def render_chapter_6(draw, frame_idx, t):
    """25s - 30s: POWER #5: HORMOZI $100M FLEET ROI: +204% VELOCITY - 0% DEADHEAD"""
    draw_header(draw, 5, "EXECUTIVE ROI: HORMOZI $100M FLEET ACCELERATOR", "EXECUTIVE", t)

    draw.text((50, 72), "HORMOZI $100M FLEET ROI MATRIX", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((560, 78), "// UNFAIR ECONOMIC SPEED & ZERO FLEET WASTE", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)

    # 4 Massive Executive KPI Cards
    # KPI 1: +204% Velocity
    prog = min(1.0, (frame_idx - 600) / 60.0)
    vel_val = int(100 + prog * 104)

    cards = [
        ("DISPATCH VELOCITY", f"+{vel_val}%", "Trips allocated in 1.2s vs 4.5m legacy", COLOR_EMERALD, COLOR_EMERALD_GLOW),
        ("DEADHEAD MILEAGE", "0.0%", "Continuous back-to-back passenger chaining", COLOR_CYAN, COLOR_CYAN_LIGHT),
        ("DAILY FULFILLMENT", "340 / 340", "$14,280 Daily Bookings • 100% Completed", COLOR_TEXT_WHITE, COLOR_EMERALD),
        ("SYSTEM REVENUE UPTIME", "100.0%", "Local offline SQLite + Instant P2P tunnel", COLOR_AMBER, COLOR_AMBER),
    ]

    for idx, (title, num, sub, col, glow_col) in enumerate(cards):
        col_idx = idx % 2
        row_idx = idx // 2
        cx = 50 + col_idx * 595
        cy = 120 + row_idx * 165

        # Card container
        draw.rounded_rectangle([cx, cy, cx + 580, cy + 150], radius=10, fill=COLOR_BG_CARD, outline=glow_col, width=2)

        # Title
        draw.text((cx + 25, cy + 18), title, fill=COLOR_TEXT_MUTED, font=FONT_HEADING)

        # Big Number
        draw.text((cx + 25, cy + 42), num, fill=glow_col, font=FONT_HERO_NUM)

        # Subtitle
        draw.text((cx + 25, cy + 112), sub, fill=COLOR_TEXT_WHITE, font=FONT_BODY)

    # Grand Finale Callout Banner at bottom (y = 470 to 645)
    draw.rounded_rectangle([50, 470, 1230, 645], radius=12, fill=(16, 24, 38), outline=COLOR_EMERALD, width=2)

    # Central Finale text
    draw.text((120, 492), "PULSE FLEET DISPATCH // THE UNFAIR ADVANTAGE", fill=COLOR_TEXT_WHITE, font=FONT_TITLE)
    draw.text((120, 532), "CLOUD-NATIVE MULTI-MODAL CAD  •  100% DATA SOVEREIGNTY  •  ZERO MONTHLY SAAS TAX", fill=COLOR_CYAN_LIGHT, font=FONT_HEADING)
    draw.text((120, 562), "OBD-II CAN-BUS • WAZE DYNAMIC REROUTE • REVENU QUÉBEC MEV • IMMEDIATE PRODUCTION DEPLOY", fill=COLOR_TEXT_MUTED, font=FONT_BODY)

    # Gold Status Badge
    draw.rounded_rectangle([120, 595, 380, 628], radius=6, fill=(40, 30, 10), outline=(245, 158, 11), width=1)
    draw.text((135, 604), "★ READY FOR COMMERCIAL FLEETS", fill=(251, 191, 36), font=FONT_HEADING)

    draw.rounded_rectangle([400, 595, 700, 628], radius=6, fill=(10, 30, 25), outline=COLOR_EMERALD, width=1)
    draw.text((415, 604), "✓ P2P TUNNEL & HTTPS ONLINE", fill=COLOR_EMERALD_GLOW, font=FONT_HEADING)

def main():
    print(f"[START] Generating {TOTAL_FRAMES} frames ({DURATION_SEC}s @ {FPS} fps)...")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    start_time = time.time()
    writer = imageio.get_writer(OUTPUT_PATH, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p')

    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / float(FPS)
        # Background
        img = Image.new('RGB', (WIDTH, HEIGHT), COLOR_BG_DARK)
        draw = ImageDraw.Draw(img)

        # Ambient Cyber Grid
        draw_cyber_grid(draw, WIDTH, HEIGHT, t)

        # Chapter Router (5 seconds each = 120 frames per chapter)
        if frame_idx < 120:
            render_chapter_1(draw, frame_idx, t)
        elif frame_idx < 240:
            render_chapter_2(draw, frame_idx, t)
        elif frame_idx < 360:
            render_chapter_3(draw, frame_idx, t)
        elif frame_idx < 480:
            render_chapter_4(draw, frame_idx, t)
        elif frame_idx < 600:
            render_chapter_5(draw, frame_idx, t)
        else:
            render_chapter_6(draw, frame_idx, t)

        # Master Footer & Telemetry progress bar
        draw_footer(draw, frame_idx, TOTAL_FRAMES, t)

        # Append to video stream
        frame_arr = np.array(img)
        writer.append_data(frame_arr)

        if (frame_idx + 1) % 120 == 0 or frame_idx == TOTAL_FRAMES - 1:
            elapsed = time.time() - start_time
            print(f"Rendered frame {frame_idx + 1}/{TOTAL_FRAMES} ({(frame_idx + 1)/TOTAL_FRAMES*100:.1f}%) in {elapsed:.2f}s")

    writer.close()
    total_time = time.time() - start_time
    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"\n[DONE] Successfully wrote video to {OUTPUT_PATH}")
    print(f"File Size: {file_size_mb:.2f} MB | Render Time: {total_time:.2f}s | FPS: {TOTAL_FRAMES/total_time:.1f}")

if __name__ == "__main__":
    main()
