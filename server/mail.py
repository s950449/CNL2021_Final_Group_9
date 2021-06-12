import smtplib
import configparser
from email.message import EmailMessage
from datetime import date
class mail:
    def __init__(self,config_path):
        self.config = configparser.ConfigParser()
        self.config.read(config_path)
        self.connect()
    def connect(self):
        self.admin = self.config['Mail']['admin']
        self.sender = self.config['Mail']['sender']
        self.smtp = smtplib.SMTP(self.config['Mail']['server'])
        self.password = self.config['Mail']['pass']
        self.smtp.ehlo()
        self.smtp.starttls()
        self.smtp.login(self.sender,self.password)
    def close(self):
        self.smtp.close()
    def testMail(self):
        msg = EmailMessage()
        msg['Subject'] = "Test Mail"
        msg['From'] = self.sender
        msg['To'] = self.admin
        msg.set_content("This is a test mail.")
        self.smtp.send_message(msg)
    def startCourse(self,receiver,meetingLink,courseID,random_token):
    #    textfile = "test.txt"
        today = date.today()
        # Open the plain text file whose name is in textfile for reading.
     #   with open(textfile) as fp:
            # Create a text/plain message
      #      msg = EmailMessage()
       #     msg.set_content(fp.read())
        msg = EmailMessage()
        msg.set_content(f"""\
        Meeting Link: {meetingLink}?courseID={courseID}&userToken={random_token}

        DO NOT REPLY THIS MAIL
        """)
        # me == the sender's email address
        # you == the recipient's email address
        msg['Subject'] = f'Meeting Link {today}'
        msg['From'] = self.sender
        msg['To'] = receiver
        # Send the message via our own SMTP server.
        self.smtp.send_message(msg)
    def newCourse(self,receiver,courseID,course_name,masterToken):
        msg = EmailMessage()
        msg['Subject'] = f'Course {course_name} Successfully Added'
        msg['From'] = self.sender
        msg['To'] = receiver
        msg.set_content(f"""\
        Course Name:{course_name}
        Course ID:{courseID}
        Master Token:{masterToken}

        DO NOT REPLY THIS MAIL
        """)
        self.smtp.send_message(msg)      


