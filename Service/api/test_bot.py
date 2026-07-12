import unittest

from Service.api.main import get_bot_reply


class BotReplyTests(unittest.TestCase):
    def test_start_message_lists_server_vacations(self):
        reply = get_bot_reply("session-1", "start")
        self.assertIn("אילת", reply)
        self.assertIn("ים המלח", reply)

    def test_destination_query_returns_matching_vacation_from_server_data(self):
        reply = get_bot_reply("session-2", "אילת")
        self.assertIn("אילת", reply)
        self.assertIn("01-07-2026", reply)

    def test_offer_query_returns_offer_titles_from_server_data(self):
        reply = get_bot_reply("session-3", "הצעות")
        self.assertIn("חבילת חוף דוגמא", reply)

    def test_price_query_returns_prices(self):
        reply = get_bot_reply("session-4", "מה המחיר")
        self.assertIn("אילת", reply)
        self.assertIn("₪", reply)

    def test_help_query_returns_help_text(self):
        reply = get_bot_reply("session-5", "מה אתה יכול לעשות")
        self.assertIn("אני יכול לענות על שאלות", reply)


if __name__ == "__main__":
    unittest.main()
