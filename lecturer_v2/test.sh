#!/bin/sh
echo $1 $2
curl -X POST -F "course_name=$1" -F "lecturer_email=$2" -F "student_form=@dummy.csv" linux13.csie.ntu.edu.tw:8000/addCourse

