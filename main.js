const path = require('path');
const express = require('express');
const session = require('express-session');
const connection = require('./database');
const flash = require('connect-flash');
const cors = require('cors');
const multer = require('multer');
const { title } = require('process');
const app = express();

const port = 8080;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Enable CORS to allow requests from the specified origin
app.use(cors({
    origin: `http://localhost:${port}`,
    methods: 'GET,POST',
    credentials: true
}));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON data
app.use(express.json());

// Configure session middleware
app.use(session({
    secret: 'dakrory',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(flash());

// Middleware to set up flash messages for success and error
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('successMessage');
    res.locals.errorMessage = req.flash('errorMessage');
    next();
});

// Authentication check middleware
function checkAuthentication(req, res, next) {
    if (req.session.userEmail) {
        next();
    } else {
        req.flash('errorMessage', 'You must log in first to access this page.');
        res.redirect('/login');
    }
}

// Home Route
app.get('/', (req, res) => {
   
    res.sendFile(path.join(__dirname, 'frontend/public', 'index.html'));
  
});

// Login Routes  =>
    app.get('/login', (req, res) => {
        const userEmail = req.session.userEmail;
        if(!userEmail){
        return res.sendFile(path.join(__dirname, 'frontend/public', 'login.html'));
        }
        res.redirect('/profile');
    });

app.post('/login', (req, res) => {
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    if (userEmail && userPassword) {
        const query = 'SELECT * FROM students WHERE email = ? AND pass = ?';
        connection.query(query, [userEmail, userPassword], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ message: 'Server error' });
                return;
            }

            if (results.length > 0) {
                req.session.userEmail = userEmail;
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }
});


app.get('/signup', (req, res) => {

    res.sendFile(path.join(__dirname, 'frontend/public', 'signup.html'));
});

// Handle form submission for signup
app.post('/signup', (req, res) => {
    const userName = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    if (userName && userEmail && userPassword) {
        const checkQuery = 'SELECT * FROM students WHERE email = ?';
        connection.query(checkQuery, [userEmail], (checkErr, checkResults) => {
            if (checkErr) {
                console.error('Error checking email:', checkErr);
                return res.status(500).json({message: 'Server error. Please try again.'});
            }

            if (checkResults.length > 0) {
                return res.status(400).json({message: 'Email already registered.'});
            }

            const insertQuery = 'INSERT INTO students (std_name, email, pass) VALUES (?, ?, ?)';
            connection.query(insertQuery, [userName, userEmail, userPassword], (insertErr) => {
                if (insertErr) {
                    console.error('Error executing query:', insertErr);
                    return res.status(500).json({message: 'Server error. Please try again.'});
                }

                req.session.userEmail = userEmail;
                return res.status(200).json({message: 'Signup successful'});
            });
        });
    } else {
        return res.status(400).json({message: 'Please provide all required fields.'});
    }
});
// eldakrory_---------------------
app.get('/profile', (req, res) => {
    const userEmail = req.session.userEmail;

    if (userEmail) {
        const query = 'SELECT * FROM students WHERE email = ?';
        connection.query(query, [userEmail], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ message: 'Server error' });
                return;
            }

            if (results.length > 0) {
                const user = results[0];
                res.render('profile', { user });
            } else {
                res.redirect('/login');
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.post('/upload-profile-picture', upload.single('profile_picture'), (req, res) => {
    const userEmail = req.session.userEmail;
    if (!userEmail) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const imageData = req.file ? req.file.buffer : null;

    if (imageData) {
        const query = 'UPDATE students SET profile_picture = ? WHERE email = ?';
        connection.query(query, [imageData, userEmail], (err, results) => {
            if (err) {
                console.error('Error updating image:', err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            res.json({ success: true, message: 'Profile picture updated successfully' });
        });
    } else {
        res.status(400).json({ success: false, message: 'No image uploaded' });
    }
});

app.get('/profile-picture', checkAuthentication, (req, res) => {
    const userEmail = req.session.userEmail;

    const query = 'SELECT profile_picture FROM students WHERE email = ?';
    connection.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error('Error retrieving image:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length > 0 && results[0].profile_picture) {
            const imageData = results[0].profile_picture;
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(imageData);
        } else {
            res.status(404).json({ success: false, message: 'Image not found' });
        }
    });
});



// Message Routes ----------------------------------------------------------------
app.get('/message', checkAuthentication, (req, res) => {

    res.sendFile(path.join(__dirname, 'frontend/public','message-page.html'));
    
});
app.post('/message', (req, res) => {
    const userEmail = req.session.userEmail;
    const title = req.body.title;
    const message = req.body.message;

    if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const checkQuery = `SELECT * FROM students WHERE email = ?`;

    connection.query(checkQuery, [userEmail], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking email:', checkErr);
            return res.status(500).json({ message: 'Server error. Please try again.' });
        }

       
        if (checkResults.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const insertQuery = `INSERT INTO message_std (email,  message_title, message_text) VALUES (?, ?, ?)`;

        connection.query(insertQuery, [userEmail, title, message], (err) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'Server error. Please try again.' });
            }

     
            return res.status(200).json({ message: 'Message sent successfully.' });
        });
    });
});



// Courses Routes
app.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public', 'courses.html'));
});


app.get('/profile/update', (req, res) => {
    // const userEmail = req.user.email; // 
    const userEmail = req.session.userEmail;

    if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

   
    const query = `
        SELECT std_name, email,  courseName
        FROM students AS s
        LEFT JOIN courses_std AS cs ON email = cs.std_email
        LEFT JOIN courses AS c ON cs.course_id = c.course_id
        WHERE s.email = ?
    `;

    connection.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Server error' });
        }

       
        const user = {
            std_name: results[0]?.std_name || 'Unknown',
            email: results[0]?.email || 'N/A',
            joined: results[0]?.joined || 'Unknown',
            profile_picture: results[0]?.profile_picture || 'default.png',
            courses: results.map(row => ({ name: row.courseName })).filter(course => course.name) 
        };

        res.render('profile', { user });
    });
});

app.post('/enroll', (req, res) => {
    const { courseId, studentEmail } = req.body;

    if (!courseId || !studentEmail) {
        return res.status(400).json({ message: 'Course ID and student email are required' });
    }


    const checkCourseQuery = `SELECT * FROM courses WHERE course_id = ?`;
    connection.query(checkCourseQuery, [courseId], (err, courseResults) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (courseResults.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }


        const checkStudentQuery = `SELECT * FROM students WHERE email = ?`;
        connection.query(checkStudentQuery, [studentEmail], (err, studentResults) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (studentResults.length === 0) {
                return res.status(404).json({ message: 'Student not found' });
            }

  
            const enrollQuery = `INSERT INTO courses_std (course_id, std_email) VALUES (?, ?)`;
            connection.query(enrollQuery, [courseId, studentEmail], (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ message: 'Server error' });
                }
                res.json({ message: 'Enrolled successfully' });
                // res.render('/profile/update');
                // res.redirect("/profile/update");
            });
        });
    });
});


app.get('/courses-detail/:courseId', (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    const query = `
        SELECT courseName
        FROM courses
        WHERE course_id = ?
    `;

    connection.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(results[0]);
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


