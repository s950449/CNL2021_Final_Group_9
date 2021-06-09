# pip install mysql-connector-python
import mysql.connector
import csv
from uuid import uuid4
import os
from datetime import datetime

class DB:
	def __init__(self, username, password, host, dbName):
		self.username = username
		self.password = password
		self.host = host
		self.dbName = dbName
		self.ServerDB = mysql.connector.connect(
			host = self.host,
			user = self.username,
			password = self.password,
			allow_local_infile = True
			)
		self.cursor = self.ServerDB.cursor()
		self.cursor.execute("set global local_infile=1")
		# create database
		sql = "CREATE DATABASE IF NOT EXISTS %s"
		na = (self.dbName, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		sql = "use %s"
		na = (self.dbName, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		# create table Courses
		sql = "show tables like \"Courses\""
		self.cursor.execute(sql)
		result = self.cursor.fetchall()
		if len(result)==0:
			self.cursor.execute("CREATE TABLE Courses ("
								+"CourseName varchar(20) NOT NULL,"
								+"CourseID varchar(64) NOT NULL,"
								+"Prof_Name varchar(20) NOT NULL,"
								+"Prof_Email varchar(64) NOT NULL,"
								+"Prof_masterToken varchar(64) NOT NULL,"
								+"meeting_link varchar(200),"
								+"UNIQUE (Prof_masterToken),"
								+"PRIMARY KEY (CourseID)"
								+")")
			self.ServerDB.commit()

	def __del__(self):
		self.ServerDB.close()

	def EndConnection(self):
		self.ServerDB.close()

	def link(self, username, password, host, dbName):
		self.username = username
		self.password = password
		self.host = host
		self.dbName = dbName
		self.ServerDB = mysql.connector.connect(
			host = self.host,
			user = self.username,
			password = self.password,
			allow_local_infile = True
			)
		self.cursor = self.ServerDB.cursor()
		self.cursor.execute("set global local_infile=1")
		self.ServerDB.commit()
		# create database
		sql = "CREATE DATABASE IF NOT EXISTS %s"
		na = (self.dbName, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		sql = "use %s"
		na = (self.dbName, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()

	# check the variable is unique or not
	# return True if it is unique
	def isUnique(self, AttributeName, TableName, clauseName, clauseValue):
		sql = "SELECT %s FROM %s WHERE %s=\"%s\""
		na = (AttributeName, TableName, clauseName, clauseValue, )
		sql = sql % na
		self.cursor.execute(sql)
		result = self.cursor.fetchall()
		if len(result)==0 :
			return True
		else :
			return False

	# Add new Course to table Courses and creat table stu_CourseID and Attendance_CourseID
	# return masterToken if success
	# return -1 if CourseID is not unique
	def addCourse(self, CourseName, Prof_Name, Prof_Email, meeting_link=""):
		# check CourseID is unique or not
		CourseID = str(uuid4()).replace("-", "_")
		while True:
			if self.isUnique("CourseID","Courses","CourseID",CourseID)==False :
				CourseID = str(uuid4()).replace("-", "_")
			else:
				break

		# create masterToken and check masterToken is unique or not
		masterToken = str(uuid4())
		while True:
			if self.isUnique("Prof_masterToken","Courses","Prof_masterToken",masterToken)==False :
				masterToken = str(uuid4())
			else :
				break
		
		# Add new Course to table Courses
		sql = "INSERT INTO Courses VALUES (\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\")"
		na = (CourseName, str(CourseID), Prof_Name, Prof_Email, masterToken, meeting_link, )
		# print(sql % na)
		sql = sql % na
		# print(sql)
		self.cursor.execute(sql)
		self.ServerDB.commit()

		# creat table Stu_CourseID
		sql = "CREATE TABLE Stu_%s ("\
				+"StuID varchar(20) NOT NULL,"\
				+"Name varchar(20) NOT NULL,"\
				+"Email varchar(64) NOT NULL,"\
				+"Auth_ID varchar(10) NOT NULL,"\
				+"IP varchar(70),"\
				+"Random_Token varchar(70),"\
				+"PRIMARY KEY (StuID),"\
				+"UNIQUE (Random_Token)"\
				+")"
		na = (CourseID, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		# creat table Attendance_CourseID
		sql = "CREATE TABLE Attendance_%s ("\
			+"StuID varchar(10) NOT NULL,"\
			+"Call_Time varchar(64) NOT NULL,"\
			+"Success boolean NOT NULL,"\
			+"ChallengeID varchar(20) NOT NULL,"\
			+"PRIMARY KEY (StuID, Call_Time)"\
			+")"
		na = (CourseID, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		return (CourseID, masterToken)

	# add Students to specific Course
	# return True when success
	# return -1 if there is no such CourseID
	# return -2 if wrong masterToken
	def addStudents(self, CourseID, masterToken, path):
		sql = "select Prof_masterToken from Courses where CourseID=\"%s\""
		na = (CourseID, )
		sql = sql % na
		self.cursor.execute(sql)
		tempToken = self.cursor.fetchall()
		if len(tempToken)==0:
			return -1
		# check authority
		tmpstr = "".join(list(tempToken[0]))
		if tmpstr==masterToken:
			sql = "load data local infile \"%s\" into table Stu_%s FIELDS TERMINATED BY ','"
			na = (path,CourseID, )
			sql = sql % na
			self.cursor.execute(sql)
			self.ServerDB.commit()
			return True
		else:
			return -2

	# generate students' random everytime
	# return a list of tuple(email, randomToken)
	# return -1 if there is no such masterToken
	def startCourse(self, masterToken):
		sql = "select CourseID from Courses where Prof_masterToken = \"%s\""
		na = (masterToken, )
		sql = sql % na
		self.cursor.execute(sql)
		CourseID = self.cursor.fetchall()
		if len(CourseID)==0:
			return -1
		CourseID = "".join(list(CourseID[0]))
		na = (CourseID, )
		sql = "select StuID, Email from Stu_%s"
		sql = sql % na
		self.cursor.execute(sql)
		result = self.cursor.fetchall()
		return_list = []
		# generate unique random token and store in return_list
		for data in result:
			randomToken = uuid4()
			while True:
				if self.isUnique( AttributeName="StuID", TableName="Stu_"+CourseID, 
					clauseName="Random_Token", clauseValue=randomToken)==False :
					randomToken = uuid4()
				else :
					break
			sql = "update Stu_%s set Random_Token=\"%s\" where StuID=\"%s\""
			na = (CourseID, randomToken, data[0])
			sql = sql % na
			self.cursor.execute(sql)
			self.ServerDB.commit()
			tmptuple = (data[1], str(randomToken))
			return_list.append(tmptuple)
		return return_list

	# add a recent roll call of a student
	# return True if success
	# return -1 if there is no such studentToken
	def challenge(self, CourseID, studentToken, timestamp, ChallengeID, Success):
		sql = "select StuID from Stu_%s where Random_Token=\"%s\""
		na = (CourseID, studentToken, )
		sql = sql%na
		self.cursor.execute(sql)
		StuID = self.cursor.fetchall()
		if len(StuID)==0:
			return -1
		StuID = "".join(list(StuID[0]))
		sql = "insert into Attendance_%s values (\"%s\",\"%s\",%s,\"%s\")"
		na = (CourseID, StuID, str(timestamp), Success, ChallengeID)
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		return True

	# update ip
	# return True if success
	# return -1 if there is no such studentToken
	def UpdateIP(self, CourseID, studentToken, ip):
		sql = "select StuID from Stu_%s where Random_Token=\"%s\""
		na = (CourseID, studentToken, )
		sql = sql%na
		self.cursor.execute(sql)
		StuID = self.cursor.fetchall()
		if len(StuID)==0:
			return -1
		StuID = "".join(list(StuID[0]))
		sql = "update Stu_%s set IP=\"%s\" where StuID=\"%s\""
		na = (CourseID, ip, StuID)
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		return True

	# get ip
	# return a list of tuple(token, ip)
	# return -1 if no such CourseID
	# return -2 if wrong masterToken
	def getIP(self, CourseID, masterToken):
		sql = "select Prof_masterToken from Courses where CourseID=\"%s\""
		na = (CourseID, )
		sql = sql % na
		self.cursor.execute(sql)
		tempToken = self.cursor.fetchall()
		if len(tempToken)==0:
			return -1
		# check authority
		tmpstr = "".join(list(tempToken[0]))
		if tmpstr==masterToken:
			sql = "select Random_Token, IP from Stu_%s"
			na = (CourseID, )
			sql = sql % na
			self.cursor.execute(sql)
			result = self.cursor.fetchall()
			return result
		else:
			return -2


	# get specific roll call result
	# return a list of tuple(StuID, Success)
	# return -1 if no such masterToken
	def getChallenge(self, masterToken, ChallengeID):
		sql = "select CourseID from Courses where Prof_masterToken = \"%s\""
		na = (masterToken, )
		print(sql % masterToken)
		sql = sql % na
		self.cursor.execute(sql)
		CourseID = self.cursor.fetchall()
		if len(CourseID)==0:
			return -1
		CourseID = "".join(list(CourseID[0]))
		sql = "select StuID, Success from Attendance_%s where ChallengeID=\"%s\""
		na = (CourseID, ChallengeID)
		sql = sql % na
		self.cursor.execute(sql)
		result = self.cursor.fetchall()
		return result

	# get roll call result and out put the result to a file
	# return file path
	def getStudent(self, CourseID, masterToken, date=""):
		cwd = os.getcwd()
		if date=="":
			sql = "select StuID , count(if(Success=1,1,NULL)) , count(if(Success=0,1,NULL)) \
			 from Attendance_%s group by StuID"
			na = (CourseID, )
			sql = sql % na
			self.cursor.execute(sql)
			result = self.cursor.fetchall()
			print(result)
			now = datetime.now()
			print(now)
			filename = cwd+"/"+str(now)+".csv"
			with open(filename,"w", newline="") as csvfile:
				writer = csv.writer(csvfile)
				for data in result:
					writer.writerow(list(data))
			return filename
		else:
			sql = "select StuID , count(if(Success=1,1,NULL)) ,"\
				+ "count(if(Success=0,1,NULL)) from Attendance_%s"\
				+ " where Call_Time like \"%s"
			na = (CourseID, date, )
			sql = sql % na
			sql = sql + "%" + "\" group by StuID"
			self.cursor.execute(sql)
			result = self.cursor.fetchall()
			print(result)
			now = datetime.now()
			print(now)
			filename = cwd+"/"+str(now)+".csv"
			with open(filename,"w", newline="") as csvfile:
				writer = csv.writer(csvfile)
				for data in result:
					writer.writerow(list(data))
			return filename

	# return all CourseNames and CourseIDs owned by the Email's owner
	def getMyCourse(self, Email):
		sql = "select CourseName, CourseID from Courses where Prof_Email=\"%s\""
		na = (Email, )
		sql = sql % na
		self.cursor.execute(sql)
		result = self.cursor.fetchall()
		if len(result)==0:
			return -1
		return result

	# update new masterToken
	def newMasterToken(self, CourseID):
		sql = "select * from Courses where CourseID=\"%s\""
		na = (CourseID, )
		sql = sql % na
		self.cursor.execute(sql)
		result = self.cursor.fetchall()
		if len(result)==0:
			return -1
		# create masterToken and check masterToken is unique or not
		masterToken = uuid4()
		while True:
			if self.isUnique("Prof_masterToken","Courses","Prof_masterToken",masterToken)==False :
				masterToken = uuid4()
			else :
				break
		sql = "update Courses set Prof_masterToken=\"%s\" where CourseID=\"%s\""
		na = (masterToken, CourseID, )
		sql = sql % na
		self.cursor.execute(sql)
		self.ServerDB.commit()
		return masterToken

















