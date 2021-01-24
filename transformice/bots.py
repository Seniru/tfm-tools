import time
import os
import asyncio
import dotenv
import json
import zlib

import Transformice
from distributive import Distributor

dotenv.load_dotenv()

HOST = "127.0.0.1"
PORT = os.getenv("SOCK_PORT") or 4242

main_loop = Transformice.loop

bots = [
    Transformice.Bot("Mapabot#1302", os.getenv("PASSWORD")),
    Transformice.Bot("Mapa_bot#9725", os.getenv("PASSWORD")),
]

distributor = Distributor(bots)


async def create_connection_main():
    reader, writer = await asyncio.open_connection(HOST, PORT, loop=main_loop)

    writer.write(
        bytes(json.dumps({"id": 1, "secret": os.getenv("CONNECTION_SECRET")}), encoding="utf-8"))
    await writer.drain()

    while True:
        data = await reader.read(100)
        data = data.decode("ascii")
        struct = {}
        print(data)

        try:
            struct = json.loads(data)
        except Exception:
            print(data)
            continue

        if struct["id"] == 1:
            print("[INFO] Successful connection to the main server!")
        elif struct["id"] == 2:
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

for bot in bots:
    bot.run()
    # wait for few seconds before connecting another bot to not get ip-banned
    time.sleep(10)

main_loop.run_until_complete(create_connection_main())

main_loop.run_forever()
