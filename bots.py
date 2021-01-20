import time
import os

import Transformice

bots = [
    Transformice.Bot("King_seniru#5890", os.getenv("PASSWORD"), "*#castle"),
    Transformice.Bot("Senirupasan#0000", os.getenv("PASSWORD"), "*#castle"),
]

for bot in bots:
    bot.run()
    time.sleep(5) # wait for few seconds before connecting another bot to not get ip-banned

Transformice.loop.run_forever()
