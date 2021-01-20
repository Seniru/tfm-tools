# Base code copied from aiotfm/advanced_bot.py

import os

import aiotfm
import asyncio
import json

API_ID = os.getenv("ID")
API_TOKEN = os.getenv("TOKEN")

loop = asyncio.get_event_loop()

class Bot(aiotfm.Client):
	def __init__(self, name, password, start_room="*#pewpew", community=0):
		super().__init__(community, True, loop=loop)
		self.pid = 0
		self.username = name
		self.password = password
		self.start_room = start_room

	async def handle_packet(self, conn, packet):
		handled = await super().handle_packet(conn, packet.copy())

		if not handled: # Add compatibility to more packets
			CCC = packet.readCode()

			if CCC == (60, 4): # Tribulle V2 enabled
				pass

	def run(self):
		self.loop.run_until_complete(self.start(API_ID, API_TOKEN))

	async def on_login_ready(self, online_players, community, country):
		print("[INFO][BOT-{name}][{country}-{commu}] Login ready... ".format(name=self.username, country=country, commu=community))
		await self.login(self.username, self.password, False, self.start_room)

	async def on_logged(self, player_id, username, played_time, community, pid):
		print(f"[INFO][BOT-{username}] Logged in to the game (id: {player_id}, commu: {community}, pid: {pid})")

	async def on_ready(self):
		print("[INFO][BOT-{name}] Connected to CP!".format(name=self.username))
	