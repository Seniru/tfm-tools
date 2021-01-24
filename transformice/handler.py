import functools

import asyncio
import zlib
import json

handler = {}

def handle_struct(identifier):
    def decorator(f):
        functools.wraps(f)
        handler[identifier] = f

        def wrapper(*args, **kwargs):
            return f(*args, **kwargs)
        return wrapper
    return decorator


@handle_struct(1)
async def on_validation(*args):
    print("[INFO] Successful connection to the main server!")


@handle_struct(2)
async def retrieve_maps(connection, distributor, data, struct):
    reader, writer = connection
    try:
        await distributor.sendRoomMessage("!np {}".format(struct["body"]))
        connection, packet = await distributor.wait_for("on_raw_socket", lambda connection, packet: packet.readCode() == (5, 2), timeout=5)
        res = {}
        res["code"] = packet.read32()
        packet.read8(), packet.read16(), packet.read16()  # mice count, round, ??
        res["xml"] = zlib.decompress(packet.readString()).decode("utf-8")
        res["author"] = packet.readUTF()
        res["perm"] = packet.read8()
        res["_ref"] = struct["_ref"]
        res["id"] = 2
        res["status"] = 1
        writer.write(bytes(json.dumps(res), encoding="utf-8"))
        await writer.drain()
    except asyncio.exceptions.TimeoutError:
        print("[ERROR] Timed out at loading {}".format(struct["body"]))
        writer.write(bytes(json.dumps({
            "id": 2,
            "status": -1,
            "reason": "timedout",
            "_ref": struct["_ref"]
        }), encoding="utf-8"))
    distributor.switch()
