import time
import os
import asyncio
import dotenv

import Transformice

dotenv.load_dotenv()

HOST = "127.0.0.1"
PORT = os.getenv("SOCK_PORT") or 4242 

main_loop = Transformice.loop

bots = [
    Transformice.Bot("Aaaaaa#4087", os.getenv("PASSWORD"), "#castle"),
    Transformice.Bot("Senirupasan#0000", os.getenv("PASSWORD"), "#castle"),
]

async def create_connection_main():
    reader, writer = await asyncio.open_connection(HOST, PORT, loop=main_loop)
    print("created the server")
    writer.write(b"something")
    await writer.drain()
    while True:
        data = await reader.read(100)
        print(data)

for bot in bots:
    bot.run()
    time.sleep(10) # wait for few seconds before connecting another bot to not get ip-banned

main_loop.run_until_complete(create_connection_main())

main_loop.run_forever()
