import logging

from streamlit_app.booking_app import BookingApp

logging.getLogger('botocore').setLevel(logging.DEBUG)

app = BookingApp()
app.launch()
