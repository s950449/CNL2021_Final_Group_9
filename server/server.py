from re import M
from flask import Flask, json,request, render_template,jsonify,g,send_file,make_response
from flask.views import View
from werkzeug.utils import secure_filename
from flask import render_template
import requests
import configparser
import os
import uuid
from datetime import datetime,timedelta
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
            self.connectDB()
            result = self.db.getActiveChallenges(courseID)
            self.closeDB()
            if result == -1:
                response = jsonify(code = -1,msg="No Such CourseID")
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            elif result == 0:
                response = jsonify(hasChallenge = 0)
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response 
            for ids,timeouts,timestamps in result:
                print(timestamps)
                if (datetime.strptime(timestamps,"%Y-%m-%d %H:%M:%S.%f") + timedelta(seconds=timeouts)) < datetime.now():
                    self.connectDB()
                    status = self.db.setActive(courseID,ids,False)
                    self.closeDB()
            self.connectDB()
            result = self.db.getStudentChallenges(courseID,self.db.getStuID(courseID,studentToken))
            self.closeDB()
            print(result)
            if result == 0 or len(result) == 0:
                response = jsonify(
                        hasChallenge = 0,
                        challengeID = 0,
                        type = 0,
                        timeout = 0,
                        timestamp = 0
                )
                response.headers.add('Access-Control-Allow-Origin','*')
                return response
            for abc_tuple in result:
                challengeID = abc_tuple[0][0]
                challengeType = abc_tuple[0][1]
                timeout = abc_tuple[0][2]
                timestamp = abc_tuple[0][3]
                hasChallenge = 1
                response = jsonify(
                    hasChallenge = hasChallenge,
                    challengeID = challengeID,
                    type = challengeType,
                    timeout =  timeout,
                    timestamp = timestamp
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
            print(request.values)
            challengeType = 0
            self.connectDB()
            challengeTarget = 0
            challengeID = self.db.addChallenge(courseID,challengeType,challengeTarget,challengeTime,datetime.now())
            self.closeDB()
            if challengeID == -1:
                response = jsonify(code = -1,msg="No Such CourseID")
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            self.connectDB()
            result = self.db.getIP(courseID,masterToken)
            self.closeDB()
            for token,naidesu in result:
                self.connectDB()
                self.db.challenge(courseID,token,datetime.now(),challengeID,False)
                self.closeDB()
            response = jsonify(code = 0,challengeID = challengeID)
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
            response = make_response(send_file(filepath,as_attachment=True))
            response.headers.add('Access-Control-Allow-Origin','*')
            return response

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
        @self.app.route('/acceptChallenge',methods=['GET','POST'])
        def recaptchaDomain():
            if request.method == 'GET':
                response = make_response(render_template("recaptchaDomain.html"))
                response.headers.add('Access-Control-Allow-Origin','*')
                return response
            print("123")
            print(request.values)
            recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify'
            recaptcha_secret_key = '6Le-piobAAAAAEuu2osQS1soaRWla-uBMn8Cserk'
            token = request.form["g-recaptcha-response"]
            courseID = request.form["courseID"]
            studentToken = request.form["studentToken"]
            challengeID = request.form['challengeID']
            print("acldajsfkdjsalkf")
            payload = {
                'secret': recaptcha_secret_key,
                'response': token,
                'remoteip': request.remote_addr,
            }
            print('test')
            response = requests.post(recaptcha_url, data = payload)
            result = response.json()
            print(result)
            success = result.get('success', None)
            if success == False:
                response = make_response(render_template("challengeFailed.html"))
                response.headers.add('Access-Control-Allow-Origin','*')
                return response
            self.connectDB()
            timestamp = datetime.today()
            result = self.db.setStudentAttendance(courseID,challengeID,self.db.getStuID(courseID,studentToken),timestamp,success)
            print(result)
            #self.db.challenge(courseID,studentToken,timestamp,"0",success)
            self.closeDB()
            response = make_response(render_template("challengeSuccessed.html"))
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
