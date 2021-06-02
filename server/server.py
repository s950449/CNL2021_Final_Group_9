from mail import mail
from flask import Flask,request, render_template,jsonify
import requests
import configparser
import os
app = Flask(__name__)
@app.route('/',methods=['GET','POST'])
def home():
    if request.method == 'POST':
        print(request.values)
    return "test"
@app.route('/check',methods=['POST','GET'])
def check():
    #student = request.values['random_token']
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        src_ip = jsonify({'ip': request.environ['REMOTE_ADDR']}), 200
    else:
        src_ip = jsonify({'ip': request.environ['HTTP_X_FORWARDED_FOR']}), 200
    print(src_ip)     
    return "You are online"   
if __name__ == '__main__':
    from sys import argv
    config = configparser.ConfigParser()
    config.read('config')
    course_name = "Testing"
    random_token = "random"
    receiver="b07902125@csie.ntu.edu.tw"
    pid = os.fork()
    if pid > 0:
        print("Initialize Web Server")
        app.run(host='0.0.0.0',port=8000)
    else:
        print("Initialize Mail Server")
        mail(receiver,course_name,random_token)