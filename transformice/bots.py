import time
import os
import asyncio
import dotenv
import json
import zlib

import Transformice
from distributive import Distributor
from handler import handler

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
    try:
        reader, writer = await asyncio.open_connection(HOST, PORT, loop=main_loop)

        writer.write(bytes(json.dumps({"id": 1, "secret": os.getenv("CONNECTION_SECRET")}), encoding="utf-8"))
        await writer.drain()

        while True:
            data = await reader.read(100)
            if not data:
                raise ConnectionResetError("Connection has resetted!")
            data = data.decode("ascii")
            struct = {}

            try:
                struct = json.loads(data)
            except json.JSONDecodeError as e:
                print(f"[FATAL] Error occured! ({e})")
                continue

            await handler[struct["id"]]((reader, writer), distributor, data, struct)
    except Exception as e:
        print(f"[FATAL] Error occured! ({e})")
        time.sleep(20)
        print("[INFO] Retrying connection...")
        main_loop.run_until_complete(await create_connection_main())

for bot in bots:
    bot.run()
    # wait for few seconds before connecting another bot to not get ip-banned
    time.sleep(10)

main_loop.run_until_complete(create_connection_main())

main_loop.run_forever()
