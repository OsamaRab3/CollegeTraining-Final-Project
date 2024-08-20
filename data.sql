
USE main;
-- Create students table
CREATE TABLE students (
    std_id INT AUTO_INCREMENT PRIMARY KEY,
    std_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    pass VARCHAR(50) NOT NULL
);

insert into students (std_name,email,pass)  values ('osama','osama@user','123');
CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    courseName VARCHAR(50) NOT NULL
);

insert into courses values  (1,"Introduction to Web Development");
insert into courses values  (2,"Data Science with Python");
insert into courses values (3,"Digital Marketing Essentials");

-- Create courses_std table
CREATE TABLE courses_std (
    course_id INT NOT NULL,
    std_email varchar(100) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (std_email) REFERENCES students(email) ON DELETE CASCADE,
    PRIMARY KEY (std_email, course_id)
);

insert into courses_std values (1,"osama@user");
insert into courses_std values (2,"osama@user");
insert into courses_std values (3,"osama@user");

CREATE TABLE message_std (
	id int AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,  
    message_title varchar(100) ,
    message_text TEXT NOT NULL,
    FOREIGN KEY (email) REFERENCES students(email) ON DELETE CASCADE,
    PRIMARY KEY (id)
);
-- from user 
ALTER TABLE students 
ADD COLUMN profile_picture BLOB;

UPDATE students
SET profile_picture = 'osama.png'
WHERE email = 'osama@user';



