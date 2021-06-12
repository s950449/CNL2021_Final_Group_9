from re import M
from flask import Flask, json,request, render_template,jsonify,g,send_file,make_response
from flask.views import View
from werkzeug.utils import secure_filename
import requests
import configparser
import os
import uuid

from werkzeug.wrappers import response
from mail import mail
from DB.DB import DB
class server:
    def connectSMTP(self):
        self.mail.connect()
    def closeSMTP(self):
        self.mail.close()
    def connectDB(self):
        self.db_cursor = self.db.link(self.config['SQL']['user'],self.config['SQL']['password'],self.config['SQL']['host'],"Testing")
    def closeDB(self):
        self.db_cursor = self.db.EndConnection()
    def __init__(self,configPath=os.path.join('server/config')):
        self.config = configparser.ConfigParser()
        self.config.read(configPath)
        self.app = Flask(__name__)
        self.mail = mail(configPath)
        self.debugMsg = "Debug\n"
        self.app.config['UPLOAD_FOLDER'] = self.config['Server']['upload_directory']
        self.db = DB(self.config['SQL']['user'],self.config['SQL']['password'],self.config['SQL']['host'],"Testing")
        self.db_cursor = self.db.link(self.config['SQL']['user'],self.config['SQL']['password'],self.config['SQL']['host'],"Testing")
        self.closeDB()
        self.closeSMTP()
        @self.app.route('/',methods=['GET','POST'])
        def home():
            if request.method == 'POST':
                print(request.values)
            return "test"
        @self.app.route('/checkChallenge',methods=['POST','GET'])
        def check():
        #student = request.values['random_token']
            if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
                src_ip = request.environ['REMOTE_ADDR']
            else:
                src_ip = request.environ['HTTP_X_FORWARDED_FOR']
            studentToken = request.values['studentToken']
            courseID = request.values['courseID']
            self.connectDB()
            if self.db.UpdateIP(courseID,studentToken,src_ip) == -1:
                response = jsonify(code = -1,msg="Error")
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            self.closeDB()
            print(studentToken,courseID)
            print(src_ip)   
            print(self.debugMsg)
            response = jsonify(
                hasChallenge = 0,
                type = 0,
                timeout = 60
            )
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        @self.app.route('/startCourse',methods=['POST'])
        def startCourse():
            masterToken = request.values['masterToken']
            courseID = request.values['courseID']
            link = request.values['link']
            print(masterToken,courseID,link)
            self.connectDB()
            mailList = self.db.startCourse(masterToken)
            self.closeDB()
            if mailList == -1:
                response = jsonify(code = -1)
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            self.connectSMTP()
            for email,randomToken in mailList:
                    self.mail.startCourse(email,link,courseID,randomToken)
                    print(email,randomToken)
            self.closeSMTP()    
            response = jsonify(code = 0,url=link+"?courseID="+courseID)
            response.headers.add('Access-Control-Allow-Origin', '*')                    
            return response
        @self.app.route('/addCourse',methods=['POST'])
        def addCourse():
            student_form = request.files['student_form']
            course_name = request.values['course_name']
            lecturer_email = request.values['lecturer_email']
            filename = secure_filename(student_form.filename)
            filepath = os.path.join(self.app.config['UPLOAD_FOLDER'],filename)
            student_form.save(filepath)
            self.connectDB()            
            courseID,masterToken = self.db.addCourse(course_name,"Test",lecturer_email)
            if self.db.addStudents(courseID,masterToken,filepath) == False:
                self.closeDB()
                response = jsonify(code = -1)
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            self.closeDB()
            self.connectSMTP()
            self.mail.newCourse(lecturer_email,courseID,course_name,masterToken)
            self.closeSMTP()
            response = jsonify(code = 0,courseID=courseID,masterToken=masterToken)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response  
        @self.app.route("/endCourse",methods=["POST"])
        def endCourse():
            masterToken = request.values["masterToken"]
            courseID = request.values["courseID"]
            response = jsonify(code = 0)
            response.headers.add('Access-Control-Allow-Origin', '*')            
            return response
        @self.app.route("/challenge",methods=["POST"])                            
        def challenge():
            masterToken = request.values["masterToken"]
            courseID = request.values["courseID"]
            challengeType = request.values["type"]        
            challengeTarget = request.values["target"]
            challengeTime = request.values["time"]
            response = jsonify(code = 0)
            response.headers.add('Access-Control-Allow-Origin', '*') 
            return response
        @self.app.route("/requestInfo",methods=["POST"])
        def requestInfo():
            masterToken = request.values["masterToken"]
            courseID = request.values["courseID"] 
            requestDate = request.values["date"]
            if requestDate == "all":
                requestDate = ""
            self.db_cursor = self.connectDB()
            filepath = self.db.getStudent(courseID,masterToken,requestDate)
            print(filepath)
            self.db_cursor = self.closeDB()
+           response = make_response(send_file(filepath,as_attachment=True))
+           response.headers.add('Access-Control-Allow-Origin','*')
+           return response

        @self.app.route("/getName",methods=["POST"])
        def getName():
            studentToken = request.values['studentToken']
            courseID = request.values['courseID']
            self.db_cursor = self.connectDB()
            studentName,courseName = self.db.getName(studentToken,courseID)
            self.db_cursor = self.closeDB()
            response = jsonify(code = 0,studentName=studentName,courseName=courseName)
            response.headers.add('Access-Control-Allow-Origin', '*')     
            return response        
if __name__ == '__main__':
    from sys import argv
    my_server = server()
    my_server.connectSMTP()
    my_server.mail.testMail()
    my_server.closeSMTP()
    app = my_server.app
    pid = os.fork()
    if pid > 0:
        print("Initialize Web Server")
        app.run(host='0.0.0.0',port=8000)
    else:
        print("Initialize Mail Server")