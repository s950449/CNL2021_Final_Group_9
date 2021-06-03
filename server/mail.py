import smtplib
import configparser
from email.message import EmailMessage
from datetime import date
class mail:
    def __init__(self,config_path):
        self.config = configparser.ConfigParser()
        self.config.read(config_path)
        self.admin = self.config['Mail']['admin']
        self.sender = self.config['Mail']['sender']
        self.smtp = smtplib.SMTP(self.config['Mail']['server'])
    def testMail(self):
        msg = EmailMessage()
        msg['Subject'] = "Test Mail"
        msg['From'] = self.sender
        msg['To'] = self.admin
        msg.set_content("This is a test mail.")
        self.smtp.send_message(msg)
        self.smtp.quit()
    def startCourse(self,receiver,course_name,random_token):
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
        msg['From'] = self.sender
        msg['To'] = receiver

        # Send the message via our own SMTP server.
        self.smtp.send_message(msg)
        self.smtp.quit()
