from mail import mail
from flask import Flask,request, render_template,jsonify,g
from flask.views import View
from werkzeug.utils import secure_filename
import requests
import configparser
import os
import uuid
#from DB import DB
class server:
    def __init__(self,configPath=os.path.join('config')):
        self.config = configparser.ConfigParser()
        self.config.read(configPath)
        self.app = Flask(__name__)
        self.mail = mail(configPath)
        self.debugMsg = "Debug\n"
        self.app.config['UPLOAD_FOLDER'] = self.config['Server']['upload_directory']
        #self.db = DB()
        #self.db_cursor = self.db.link(self.config['SQL']['user'],self.config['SQL']['password'],self.config['SQL']['host'],"Testing")
        @self.app.route('/',methods=['GET','POST'])
        def home():
            if request.method == 'POST':
                print(request.values)
            return "test"
        @self.app.route('/checkConnection',methods=['POST','GET'])
        def check():
        #student = request.values['random_token']
            if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
                src_ip = jsonify({'ip': request.environ['REMOTE_ADDR']}), 200
            else:
                src_ip = jsonify({'ip': request.environ['HTTP_X_FORWARDED_FOR']}), 200
            print(src_ip)   
            print(self.debugMsg)
            return "You are online"
        @self.app.route('/addCourse',methods=['POST'])
        def addCourse():
            masterToken = request.values['masterToken']
            courseID = request.values['courseID']
            link = request.values['link']
            print(masterToken,courseID,link)
            return "Add Course"
        @self.app.route('/newCourse',methods=['POST'])
        def newCourse():
            student_form = request.files['student_form']
            course_name = request.values['course_name']
            lecturer_email = request.values['lecturer_email']
            filename = secure_filename(student_form.filename)
            filepath = os.path.join(self.app.config['UPLOAD_FOLDER'],filename)
            student_form.save(filepath)
            courseID=uuid.uuid4()
            #masterToken = DB.addCourse(self.db_cursor,courseID,course_name,filepath)
            masterToken = uuid.uuid4()
            self.mail.newCourse(lecturer_email,courseID,course_name,masterToken)
            return "New Course"                    
if __name__ == '__main__':
    from sys import argv
    my_server = server()
    my_server.mail.testMail()
    app = my_server.app
    pid = os.fork()
    if pid > 0:
        print("Initialize Web Server")
        app.run(host='0.0.0.0',port=8000)
    else:
        print("Initialize Mail Server")