from mail import mail
from flask import Flask,request, render_template,jsonify
import requests
import configparser
import os
#from DB import DB
class server:
    def __init__(self,configPath='config'):
        self.config = configparser.ConfigParser()
        self.config.read(configPath)
        self.mail = mail(configPath)
app = Flask(__name__)
@app.route('/',methods=['GET','POST'])
def home():
    if request.method == 'POST':
        print(request.values)
    return "test"
@app.route('/checkConnection',methods=['POST','GET'])
def check():
    #student = request.values['random_token']
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        src_ip = jsonify({'ip': request.environ['REMOTE_ADDR']}), 200
    else:
        src_ip = jsonify({'ip': request.environ['HTTP_X_FORWARDED_FOR']}), 200
    print(src_ip)     
    return "You are online"
#@app.route('/addCourse',methods=['POST'])
#def addCourse(course_name,lecturer_email,student_form):
#@app.route('/startCourse',methods=['POST'])
#def startCourse(masterToken,courseID,link):

if __name__ == '__main__':
    from sys import argv
    my_server = server()
    my_server.mail.testMail()
    pid = os.fork()
    if pid > 0:
        print("Initialize Web Server")
        app.run(host='0.0.0.0',port=8000)
    else:
        print("Initialize Mail Server")