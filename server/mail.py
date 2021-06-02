import smtplib
import configparser
from email.message import EmailMessage
from datetime import date
def mail(receiver,course_name,random_token):
    config = configparser.ConfigParser()
    config.read('config')
    sender = config['Mail']['sender']
    textfile = "test.txt"
    today = date.today()
    # Open the plain text file whose name is in textfile for reading.
    with open(textfile) as fp:
        # Create a text/plain message
        msg = EmailMessage()
        msg.set_content(fp.read())

    # me == the sender's email address
    # you == the recipient's email address
    msg['Subject'] = f'{course_name} Meeting Link {today}'
    msg['From'] = sender
    msg['To'] = receiver

    # Send the message via our own SMTP server.
    s = smtplib.SMTP(config['Mail']['server'])
    s.send_message(msg)
    s.quit()