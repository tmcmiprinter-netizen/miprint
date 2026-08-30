const SUPABASE_URL = "https://gwkcpbncazaeuiqdxqyn.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a2NwYm5jYXphZXVpcWR4cXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODgyMzAsImV4cCI6MjEwMzI2NDIzMH0.bA0AwTwXn9TAK3szVxwiC9QQyRde3Dyt0DrSXABFQ1w";

const LEARNING_APPLICATION_URL =
  `${SUPABASE_URL}/functions/v1/submit-learning-application`;

  const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const STORE_KEY="miPrintLearningV1";
const starterCourse={
 id:"course-windows-basics-1",title:"Windows Basics Starter",subtitle:"Computer Literacy • Section 1",
 description:"An introductory computer literacy lesson covering the Windows desktop, Start menu, taskbar, files, folders and basic window navigation.",
 section:1,published:true,
 summary:`Windows is an operating system that lets you interact with a computer using windows, icons, menus and a pointer.

The Desktop is the main screen after signing in. The Taskbar usually appears at the bottom and shows the Start button, open apps and system icons.

The Start menu opens applications, searches for files and gives access to settings or power options. A window can be minimized, maximized/restored or closed.

Files store information such as documents, pictures and PDFs. Folders help organise files. File Explorer lets you browse drives, folders and files.

The Recycle Bin temporarily stores deleted files so they can sometimes be restored before permanent deletion.`,
 questions:[
  {id:"q1",text:"Which items are normally found on the Windows taskbar?",answers:[{text:"Start button",correct:true},{text:"Open application icons",correct:true},{text:"System clock",correct:true},{text:"Printed paper tray",correct:false}]},
  {id:"q2",text:"Which actions can you normally perform using controls in the top-right corner of a window?",answers:[{text:"Minimize the window",correct:true},{text:"Maximize or restore the window",correct:true},{text:"Close the window",correct:true},{text:"Format the hard drive",correct:false}]},
  {id:"q3",text:"Which statements about files and folders are correct?",answers:[{text:"Files can store documents, images or PDFs",correct:true},{text:"Folders help organise files",correct:true},{text:"File Explorer can browse files",correct:true},{text:"A folder is a printer cartridge",correct:false}]},
  {id:"q4",text:"What can the Windows Start menu be used for?",answers:[{text:"Opening applications",correct:true},{text:"Searching for files",correct:true},{text:"Accessing settings",correct:true},{text:"Physically repairing a monitor",correct:false}]},
  {id:"q5",text:"Which statements about the Recycle Bin are correct?",answers:[{text:"It can temporarily hold deleted files",correct:true},{text:"Some deleted files can be restored",correct:true},{text:"It is used to browse the internet",correct:false},{text:"It can be emptied to permanently remove contents",correct:true}]}
 ]
};
function initialState(){return{admin:{email:"admin@miprint.local",password:"Admin2026!"},course:starterCourse,applications:[],students:[],courseClosed:false,lastAnnualCleanupYear:null,certificateSequence:{}}}
function annualCleanup(){
 const now=new Date(); const year=now.getFullYear();
 const last=state?.lastAnnualCleanupYear;
 // In the browser prototype, run the cleanup when the page is opened on 1 January.
 // Production will perform the same policy server-side so it cannot be bypassed by a closed browser.
 if(now.getMonth()===0 && now.getDate()===1 && last!==year){
   state.applications=[];
   state.lastAnnualCleanupYear=year;
   saveState();
 }
}
function loadState(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||initialState()}catch{return initialState()}}
let state=loadState(),session=null,adminQuestionDraft=[]; annualCleanup();
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
function saveState(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function openModal(id){$(id).classList.add("open")} function closeModal(id){$(id).classList.remove("open")}
$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
["loginOpenBtn","heroLoginBtn"].forEach(id=>$(id).onclick=()=>openModal("loginModal"));
["registerOpenBtn","heroRegisterBtn"].forEach(id=>$(id).onclick=()=>openModal("registerModal"));

$("regNationality").onchange=()=>{const sa=$("regNationality").value==="South African";$("identityLabel").textContent=sa?"South African identity number":"Passport number";$("documentLabel").textContent=sa?"Certified ID document":"Valid passport copy"};

$("registerSubmitBtn").onclick = async () => {
  const btn = $("registerSubmitBtn");
  const msg = $("registerMessage");

  const file = $("regDocument").files[0];

  const fullName = $("regFullName").value.trim();
  const legalName =
  fullName.replace(/\s+/g, " ").trim();

const nameParts =
  legalName.split(" ");

if (nameParts.length < 2) {
  msg.className =
    "form-message error";

  msg.textContent =
    "Enter your surname first, followed by all your names exactly as they appear on your ID or passport.";

  return;
}
  const email = $("regEmail").value.trim().toLowerCase();
  const phone = $("regPhone").value.trim();
  const nationality = $("regNationality").value;
  const birthYear = $("regBirthYear").value.trim();
  const identity = $("regIdentity").value.trim();
  const address = $("regAddress").value.trim();
  const education = $("regEducation").value;
  const currentStatus = $("regStatus").value;
  const consent = $("regConsent").checked;

  msg.className = "form-message";
  msg.textContent = "";

  // ----------------------------------------------------------
  // Required fields
  // ----------------------------------------------------------

  if (
    !fullName ||
    !email ||
    !phone ||
    !nationality ||
    !birthYear ||
    !identity ||
    !address ||
    !file ||
    !consent
  ) {
    msg.className = "form-message error";
    msg.textContent =
      "Please complete all required fields and attach the required certified ID/passport.";

    return;
  }

  // ----------------------------------------------------------
  // PDF validation
  // ----------------------------------------------------------

  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    msg.className = "form-message error";
    msg.textContent =
      "ID/passport copy must be a PDF file only.";

    return;
  }

  // ----------------------------------------------------------
  // 25 MB validation
  // ----------------------------------------------------------

  if (file.size > 25 * 1024 * 1024) {
    msg.className = "form-message error";
    msg.textContent =
      "The PDF is larger than 25 MB. Please choose a smaller file.";

    return;
  }

  // ----------------------------------------------------------
  // Build FormData for Edge Function
  // ----------------------------------------------------------

  const formData = new FormData();

  formData.append(
  "full_name",
  legalName
);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("nationality", nationality);
  formData.append("birth_year", birthYear);
  formData.append("identity_or_passport", identity);
  formData.append("residential_address", address);
  formData.append("education_level", education);
  formData.append("current_status", currentStatus);
  formData.append("document", file);

  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------

  const originalButtonText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

  msg.className = "form-message";
  msg.textContent =
    "Uploading your application. Please wait...";

  try {
    const response = await fetch(
      LEARNING_APPLICATION_URL,
      {
        method: "POST",

        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },

        body: formData
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Application could not be submitted."
      );
    }

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    msg.className = "form-message success";
    msg.textContent =
      result.message ||
      "Application submitted successfully. mi Print will review it before activating your student account.";

    // Clear the form
    $("regFullName").value = "";
    $("regEmail").value = "";
    $("regPhone").value = "";
    $("regNationality").value = "";
    $("regBirthYear").value = "";
    $("regIdentity").value = "";
    $("regAddress").value = "";
    $("regEducation").value = "";
    $("regStatus").value = "";
    $("regDocument").value = "";
    $("regConsent").checked = false;

    setTimeout(() => {
      closeModal("registerModal");

      msg.className = "form-message";
      msg.textContent = "";
    }, 2000);

  } catch (error) {
    console.error(
      "Learning application submission failed:",
      error
    );

    msg.className = "form-message error";
    msg.textContent =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";

  } finally {
    btn.disabled = false;
    btn.innerHTML = originalButtonText;
  }
};

$("loginSubmitBtn").onclick = async () => {
  const email = $("loginEmail").value
    .trim()
    .toLowerCase();

  const password = $("loginPassword").value.trim();
  const msg = $("loginMessage");
  const btn = $("loginSubmitBtn");

  msg.className = "form-message";
  msg.textContent = "";

  if (!email || !password) {
    msg.className = "form-message error";
    msg.textContent =
      "Please enter your email address and password.";
    return;
  }

  const originalText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

  try {
    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Login failed.");
    }

    // Check whether this authenticated user is an admin.
    const {
      data: isAdmin,
      error: adminCheckError
    } = await supabaseClient.rpc(
      "is_learning_admin"
    );

    if (adminCheckError) {
      console.error(adminCheckError);

      await supabaseClient.auth.signOut();

      throw new Error(
        "Unable to verify administrator access."
      );
    }

    if (isAdmin === true) {
      session = {
        role: "admin",
        authUserId: data.user.id
      };

      closeModal("loginModal");

      await showAdmin();

      return;
    }

    const student = await loadCurrentStudent(
  data.user.id
);

if (!student) {
  await supabaseClient.auth.signOut();

  throw new Error(
    "This account is not registered as a student."
  );
}

if (!student.active) {
  await supabaseClient.auth.signOut();

  throw new Error(
    "Your student account has been deactivated."
  );
}

session = {
  role: "student",
  studentId: student.id,
  authUserId: data.user.id
};

closeModal("loginModal");

showStudent();

return;

  } catch (error) {
    console.error("Login error:", error);

    msg.className = "form-message error";

    msg.textContent =
      error?.message ||
      "Login details not recognised.";

  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
};

async function loadAdminApplications() {
  const {
    data,
    error
  } = await supabaseClient
    .from("learning_applications")
    .select(`
      id,
      full_name,
      email,
      phone,
      nationality,
      birth_year,
      identity_or_passport,
      residential_address,
      education_level,
      current_status,
      document_path,
      application_status,
      rejection_reason,
      created_at
    `)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Unable to load applications:",
      error
    );

    throw new Error(
      "Unable to load student applications."
    );
  }

  state.applications = (data || []).map(app => ({
    id: app.id,

    fullName: app.full_name,
    email: app.email,
    phone: app.phone,
    nationality: app.nationality,
    birthYear: app.birth_year,
    identity: app.identity_or_passport,
    address: app.residential_address,
    education: app.education_level,
    currentStatus: app.current_status,

    documentPath: app.document_path,

    documentName:
      app.document_path
        ? "Certified document"
        : "No document",

    status: app.application_status,

    rejectionReason: app.rejection_reason,
    appliedAt: app.created_at
  }));
}

async function loadAdminStudents() {
  const {
    data,
    error
  } = await supabaseClient
    .from("learning_students")
    .select(`
      id,
      application_id,
      auth_user_id,
      full_name,
      email,
      birth_year,
      phone,
      nationality,
      identity_or_passport,
      residential_address,
      education_level,
      current_status,
      active,
      created_at
    `)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Unable to load students:",
      error
    );

    throw new Error(
      "Unable to load approved students."
    );
  }

  state.students = (data || []).map(student => ({
    id: student.id,
    applicationId: student.application_id,
    authUserId: student.auth_user_id,
    fullName: student.full_name,
    email: student.email,
    birthYear: student.birth_year,
    phone: student.phone,
    nationality: student.nationality,
    identity: student.identity_or_passport,
    address: student.residential_address,
    education: student.education_level,
    currentStatus: student.current_status,
    active: student.active,

    // temporary until attempts/certificates move to Supabase
    progress: {},
    certificates: []
  }));
}

async function loadCurrentStudent(authUserId) {
  const {
    data,
    error
  } = await supabaseClient
    .from("learning_students")
    .select(`
      id,
      application_id,
      auth_user_id,
      full_name,
      email,
      birth_year,
      phone,
      nationality,
      identity_or_passport,
      residential_address,
      education_level,
      current_status,
      active,
      created_at
    `)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load student:",
      error
    );

    throw new Error(
      "Unable to load student account."
    );
  }

  if (!data) {
    return null;
  }

  const student = {
    id: data.id,
    applicationId: data.application_id,
    authUserId: data.auth_user_id,
    fullName: data.full_name,
    email: data.email,
    birthYear: data.birth_year,
    phone: data.phone,
    nationality: data.nationality,
    identity: data.identity_or_passport,
    address: data.residential_address,
    education: data.education_level,
    currentStatus: data.current_status,
    active: data.active,

    // Temporary until assessments/certificates move to Supabase
    progress: {},
    certificates: []
  };

  state.students = [student];

  return student;
}

async function checkInvitationSession() {
  try {
    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session?.user) {
      return;
    }

    const user = session.user;

    // Admins should not see the password setup modal.
    const {
      data: isAdmin,
      error: adminError
    } = await supabaseClient.rpc(
      "is_learning_admin"
    );

    if (!adminError && isAdmin === true) {
      return;
    }

    // Check if this authenticated user is an approved student.
    const {
      data: student,
      error
    } = await supabaseClient
      .from("learning_students")
      .select(`
        id,
        active,
        auth_user_id
      `)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Invitation student check failed:",
        error
      );

      return;
    }

    if (!student) {
      return;
    }

    if (!student.active) {
      return;
    }

    // Student is authenticated through the invitation.
    // Show password creation modal.
    openModal("setPasswordModal");

  } catch (error) {
    console.error(
      "Invitation session check failed:",
      error
    );
  }
}

$("setPasswordBtn").onclick = async () => {
  const password =
    $("newStudentPassword").value;

  const confirmPassword =
    $("confirmStudentPassword").value;

  const msg =
    $("setPasswordMessage");

  const btn =
    $("setPasswordBtn");

  msg.className =
    "form-message";

  msg.textContent = "";

  if (
    !password ||
    !confirmPassword
  ) {
    msg.className =
      "form-message error";

    msg.textContent =
      "Please enter and confirm your password.";

    return;
  }

  if (password.length < 8) {
    msg.className =
      "form-message error";

    msg.textContent =
      "Password must be at least 8 characters.";

    return;
  }

  if (password !== confirmPassword) {
    msg.className =
      "form-message error";

    msg.textContent =
      "The passwords do not match.";

    return;
  }

  const originalText =
    btn.innerHTML;

  btn.disabled = true;

  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Creating password...';

  try {
    const {
      data,
      error
    } = await supabaseClient.auth.updateUser({
      password
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(
        "Password could not be created."
      );
    }

    msg.className =
      "form-message success";

    msg.textContent =
      "Password created successfully.";

    $("newStudentPassword").value = "";
    $("confirmStudentPassword").value = "";

    setTimeout(async () => {
      closeModal(
        "setPasswordModal"
      );

      // Sign them out so they can test
      // the normal student login.
      await supabaseClient.auth.signOut();

      openModal("loginModal");

      $("loginMessage").className =
        "form-message success";

      $("loginMessage").textContent =
        "Your password is ready. Log in with your student email and new password.";

    }, 1200);

  } catch (error) {
    console.error(
      "Password creation failed:",
      error
    );

    msg.className =
      "form-message error";

    msg.textContent =
      error?.message ||
      "Unable to create your password.";

  } finally {
    btn.disabled = false;
    btn.innerHTML =
      originalText;
  }
};

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (
      event === "PASSWORD_RECOVERY" &&
      session?.user
    ) {
      openModal("setPasswordModal");
    }

  }
);

$("forgotPasswordBtn").onclick = async () => {
  const email = $("loginEmail").value.trim();
  const msg = $("loginMessage");
  const btn = $("forgotPasswordBtn");

  msg.className = "form-message";
  msg.textContent = "";

  if (!email) {
    msg.className = "form-message error";
    msg.textContent =
      "Enter your student email address first.";
    return;
  }

  const originalText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

  try {
    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "https://tmcmiprinter-netizen.github.io/miprint/learning.html"
        }
      );

    if (error) {
      throw error;
    }

    msg.className = "form-message success";
    msg.textContent =
      "Check your email for the password setup link.";

  } catch (error) {
    console.error(error);

    msg.className = "form-message error";
    msg.textContent =
      error?.message ||
      "Unable to send password setup email.";

  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
};

function hidePublic(){document.querySelector(".topbar").classList.add("hidden");$("publicLanding").classList.add("hidden")}
function showPublic(){document.querySelector(".topbar").classList.remove("hidden");$("publicLanding").classList.remove("hidden");$("studentApp").classList.add("hidden");$("adminApp").classList.add("hidden");session=null}
$("studentLogoutBtn").onclick=showPublic;$("adminLogoutBtn").onclick = async () => {
  await supabaseClient.auth.signOut();
  showPublic();
  checkInvitationSession();
};
function currentStudent(){return state.students.find(s=>s.id===session?.studentId)}
async function loadStudentCourse() {

  const {
    data: course,
    error
  } = await supabaseClient
    .from("learning_courses")
    .select(`
      id,
      title,
      subtitle,
      description,
      section_number,
      summary,
      published,
      closed,
      assessment_open
    `)
    .eq("published", true)
    .eq("closed", false)
    .order("created_at", {
      ascending: false
    })
    .limit(1)
    .maybeSingle();


  if (error) {

    console.error(
      "Unable to load student course:",
      error
    );

    throw new Error(
      "Unable to load the course."
    );
  }


  /*
   * No published course.
   */
  if (!course) {

    state.course = {
      id: null,
      title: "No course available",
      subtitle: "",
      description:
        "There is currently no published course.",
      section: 1,
      summary: "",
      published: false,
      assessmentOpen: false,
      questions: []
    };

    state.courseClosed = true;

    return null;
  }


  /*
   * -------------------------------------------------
   * Assessment questions
   * -------------------------------------------------
   *
   * Do NOT request questions unless the
   * administrator opened the assessment.
   */

  let studentQuestions = [];


  if (course.assessment_open === true) {

    const {
      data: assessmentRows,
      error: assessmentError
    } = await supabaseClient.rpc(
      "get_learning_assessment_options",
      {
        p_course_id: course.id
      }
    );


    if (assessmentError) {

      console.error(
        "Unable to load assessment options:",
        assessmentError
      );

      throw new Error(
        "Unable to load the assessment."
      );
    }


    const questionMap =
      new Map();


    for (
      const row of assessmentRows || []
    ) {

      if (
        !questionMap.has(
          row.question_id
        )
      ) {

        questionMap.set(
          row.question_id,
          {
            id: row.question_id,

            text:
              row.question_text,

            sortOrder:
              row.question_sort_order || 0,

            answers: []
          }
        );
      }


      questionMap
        .get(row.question_id)
        .answers.push({
          id: row.answer_id,

          text:
            row.answer_text,

          sortOrder:
            row.answer_sort_order || 0
        });
    }


    studentQuestions =
      Array.from(
        questionMap.values()
      )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        )
        .map(
          question => ({
            id: question.id,

            text:
              question.text,

            answers:
              question.answers
                .sort(
                  (a, b) =>
                    a.sortOrder -
                    b.sortOrder
                )
                .map(
                  answer => ({
                    id: answer.id,
                    text: answer.text
                  })
                )
          })
        );
  }


  /*
   * Save course in student state.
   */
  state.course = {

    id:
      course.id,

    title:
      course.title,

    subtitle:
      course.subtitle || "",

    description:
      course.description || "",

    section:
      course.section_number || 1,

    summary:
      course.summary || "",

    published:
      course.published === true,

    assessmentOpen:
      course.assessment_open === true,

    questions:
      studentQuestions
  };


  state.courseClosed =
    course.closed === true;


  return state.course;
}

async function loadStudentProgress() {
  const student =
    currentStudent();

  if (!student?.id) {
    throw new Error(
      "Student account could not be loaded."
    );
  }

  const {
    data: attempts,
    error: attemptsError
  } = await supabaseClient
    .from("learning_attempts")
    .select(`
      id,
      course_id,
      attempt_number,
      score,
      result,
      submitted_at
    `)
    .eq("student_id", student.id)
    .order("attempt_number", {
      ascending: true
    });

  if (attemptsError) {
    console.error(
      "Unable to load attempts:",
      attemptsError
    );

    throw attemptsError;
  }

  const {
    data: certificates,
    error: certificatesError
  } = await supabaseClient
    .from("learning_certificates")
    .select(`
      id,
      course_id,
      certificate_number,
      score,
      awarded_at
    `)
    .eq("student_id", student.id)
    .order("awarded_at", {
      ascending: false
    });

  if (certificatesError) {
    console.error(
      "Unable to load certificates:",
      certificatesError
    );

    throw certificatesError;
  }

  student.progress = {};

  for (const attempt of attempts || []) {
    if (!student.progress[attempt.course_id]) {
      student.progress[attempt.course_id] = {
        attempts: []
      };
    }

    student.progress[
      attempt.course_id
    ].attempts.push({
      id: attempt.id,
      attemptNumber:
        attempt.attempt_number,
      score: attempt.score,
      result: attempt.result,
      submittedAt:
        attempt.submitted_at
    });
  }

  student.certificates =
    (certificates || []).map(
      certificate => ({
        id: certificate.id,
        courseId:
          certificate.course_id,
        number:
          certificate.certificate_number,
        score:
          certificate.score,
        awardedAt:
          certificate.awarded_at
      })
    );
}

async function showStudent() {
  try {
    await loadStudentCourse();
    await loadStudentProgress();

    hidePublic();

    hidePublic();

    $("studentApp")
      .classList.remove("hidden");

    $("adminApp")
      .classList.add("hidden");

    renderStudent();

    showStudentView(
      "studentDashboard"
    );

  } catch (error) {
    console.error(
      "Student course loading failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to load your course."
    );
  }
}

async function loadAdminCourse() {
  const {
    data,
    error
  } = await supabaseClient
    .from("learning_courses")
    .select(`
      id,
      title,
      subtitle,
      description,
      section_number,
      summary,
      published,
      closed,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: false
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load course:",
      error
    );

    throw new Error(
      "Unable to load the learning course."
    );
  }

  if (!data) {
    return null;
  }

  const {
    data: questions,
    error: questionsError
  } = await supabaseClient
    .from("learning_questions")
    .select(`
      id,
      question_text,
      sort_order,
      learning_answers (
        id,
        answer_text,
        is_correct,
        sort_order
      )
    `)
    .eq("course_id", data.id)
    .order("sort_order", {
      ascending: true
    });

  if (questionsError) {
    console.error(
      "Unable to load questions:",
      questionsError
    );

    throw new Error(
      "Unable to load course questions."
    );
  }

  state.course = {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle || "",
    description: data.description || "",
    section: data.section_number || 1,
    summary: data.summary || "",
    published: data.published === true,

    questions: (questions || []).map(
  question => ({
    id: question.id,

    text:
      question.question_text,

    answers:
      (question.learning_answers || [])
        .sort(
          (a, b) =>
            (a.sort_order || 0) -
            (b.sort_order || 0)
        )
        .map(answer => ({
          id: answer.id,
          text: answer.answer_text,
          correct:
            answer.is_correct === true
        }))
  })
)
  };

  state.courseClosed =
    data.closed === true;

  return state.course;
}

async function showAdmin() {
  hidePublic();

  $("adminApp").classList.remove("hidden");
  $("studentApp").classList.add("hidden");

  try {
 await loadAdminApplications();
await loadAdminStudents();
await loadAdminCourse();

  renderAdmin();
    showAdminView("adminDashboard");

  } catch (error) {
    console.error(error);

    $("applicationsTable").innerHTML = `
      <div class="locked-card">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Applications could not be loaded</h3>
        <p>${esc(error.message)}</p>
      </div>
    `;
  }
}
function showStudentView(id){$$("#studentApp .app-view").forEach(v=>v.classList.add("hidden"));$(id).classList.remove("hidden");$$("[data-student-view]").forEach(b=>b.classList.toggle("active",b.dataset.studentView===id))}
function showAdminView(id){$$("#adminApp .app-view").forEach(v=>v.classList.add("hidden"));$(id).classList.remove("hidden");$$("[data-admin-view]").forEach(b=>b.classList.toggle("active",b.dataset.adminView===id))}
$$("[data-student-view]").forEach(
  button => {

    button.onclick = async () => {

      const view =
        button.dataset.studentView;

      /*
       * Whenever the student opens
       * the Course page, check Supabase
       * for the newest available course.
       */
      if (view === "studentCourse") {

        try {

          await loadStudentCourse();

          await loadStudentProgress();

          renderStudent();

        } catch (error) {

          console.error(
            "Course refresh failed:",
            error
          );

          alert(
            error?.message ||
            "Unable to check for available courses."
          );
        }
      }

      showStudentView(view);
    };
  }
);
$$("[data-admin-view]").forEach(b=>b.onclick=()=>showAdminView(b.dataset.adminView));$$("[data-student-jump]").forEach(b=>b.onclick=()=>showStudentView(b.dataset.studentJump));$$("[data-admin-jump]").forEach(b=>b.onclick=()=>showAdminView(b.dataset.adminJump));
$("studentMenuBtn").onclick=()=>document.querySelector("#studentApp .sidebar").classList.toggle("open");$("adminMenuBtn").onclick=()=>document.querySelector("#adminApp .sidebar").classList.toggle("open");

function bestScore(s){const a=s.progress?.[state.course.id]?.attempts||[];return a.length?Math.max(...a.map(x=>x.score)):null}
function hasCert(s){return (s.certificates||[]).some(c=>c.courseId===state.course.id)}
function renderStudent(){
 const s=currentStudent(),p=s.progress?.[state.course.id]||{attempts:[]},best=bestScore(s);
 $("studentWelcome").textContent=`Welcome, ${s.fullName.split(" ")[0]}`;$("dashProgress").textContent=p.attempts.length?`${p.attempts.length}/2 attempts used`:"Not started";$("dashMark").textContent=best===null?"—":`${best}%`;$("dashCertificates").textContent=(s.certificates||[]).length;
 ["dashCourseTitle","courseTitleStudent","courseHeadingStudent"].forEach(id=>$(id).textContent=state.course.title);$("dashCourseDescription").textContent=state.course.description;$("courseSubtitleStudent").textContent=state.course.subtitle;$("courseDescriptionStudent").textContent=state.course.description;
 const left=Math.max(0,2-p.attempts.length);$("attemptChip").textContent=`${left} attempts available`;$("attemptsRemaining").textContent=`${left} attempts remaining`;
 const allowed=state.course.published&&!state.courseClosed&&s.active;$("courseLocked").classList.toggle("hidden",allowed);$("courseContent").classList.toggle("hidden",!allowed);
 $("summarySections").innerHTML=`<article class="summary-card"><h4>Section ${state.course.section}: ${esc(state.course.title)}</h4><p>${esc(state.course.summary)}</p></article>`;
 renderAssessment(s);renderResults(s);renderCerts(s);renderProfile(s);
 $("studentUpdateFeed").innerHTML=`<div class="update-item"><strong>Application approved</strong><span>Your student account is active.</span></div><div class="update-item"><strong>${state.course.published?"Course published":"Course hidden"}</strong><span>${esc(state.course.title)}</span></div>${best!==null?`<div class="update-item"><strong>Best mark: ${best}%</strong><span>${best>=60?"Pass":"Not yet passed"}</span></div>`:""}`
}
function nextCertificateCode(){
 const year=new Date().getFullYear();
 state.certificateSequence ||= {};
 state.certificateSequence[year]=(state.certificateSequence[year]||0)+1;
 return `MIP-${year}-${String(state.certificateSequence[year]).padStart(5,"0")}`;
}
function renderAssessment(s) {

  /*
   * Assessment has not started.
   */
  if (!state.course.assessmentOpen) {

    $("assessmentForm").innerHTML = `
      <div class="locked-card">
        <i class="fa-solid fa-lock"></i>

        <h3>Assessment Locked</h3>

        <p>
          The assessment has not started yet.
          Continue studying the course summary
          and wait for your facilitator to open
          the assessment.
        </p>
      </div>
    `;

    $("submitAssessmentBtn").disabled =
      true;

    $("submitAssessmentBtn").textContent =
      "Assessment Locked";

    return;
  }


  const attempts =
    s.progress?.[state.course.id]?.attempts ||
    [];

  const disabled =
    attempts.length >= 2;


  $("assessmentForm").innerHTML =
    state.course.questions
      .map(
        (q, qi) => `
          <div class="question-card">

            <h4>
              ${qi + 1}. ${esc(q.text)}
            </h4>

            ${q.answers
              .map(
                a => `
                  <label class="option">

                    <input
                      type="radio"
                      name="${q.id}"
                      value="${a.id}"
                      ${disabled ? "disabled" : ""}
                    >

                    <span>
                      ${esc(a.text)}
                    </span>

                  </label>
                `
              )
              .join("")}

          </div>
        `
      )
      .join("");


  $("submitAssessmentBtn").disabled =
    disabled;

  $("submitAssessmentBtn").textContent =
    disabled
      ? "No attempts remaining"
      : "Submit Assessment";
}
function renderResults(s){const a=s.progress?.[state.course.id]?.attempts||[];$("studentResultsContent").innerHTML=a.length?a.map(x=>`<article class="result-card"><div class="result-score ${x.result==="fail"?"fail":""}">${x.score}%</div><div><h3>${esc(state.course.title)} • Attempt ${x.attempt}</h3><p>${new Date(x.submittedAt).toLocaleString()}</p></div><div class="result-status ${x.result}">${x.result.toUpperCase()}</div></article>`).join(""):`<div class="locked-card"><i class="fa-solid fa-chart-simple"></i><h3>No results yet</h3><p>Complete your assessment to see your marks.</p></div>`}
function renderCerts(s){const c=s.certificates||[];$("studentCertificateList").innerHTML=c.length?c.map(x=>`<article class="certificate-card"><h3>${esc(x.courseTitle)}</h3><p>${new Date(x.awardedAt).toLocaleDateString()} • ${x.score}%</p><button class="primary-btn" onclick="openCertificate('${s.id}','${x.id}')">View Certificate</button></article>`).join(""):`<div class="locked-card"><i class="fa-solid fa-award"></i><h3>No certificates yet</h3><p>Pass a course to receive a certificate.</p></div>`}
function renderProfile(s){const rows=[["Full name",s.fullName],["Email",s.email],["Phone",s.phone],["Nationality",s.nationality],["Identity / Passport","••••••"+String(s.identity).slice(-4)],["Year of birth",s.birthYear],["Education",s.education],["Current status",s.currentStatus],["Application","Approved"],["Document",s.documentName]];$("studentProfileCard").innerHTML=rows.map(([k,v])=>`<div class="profile-item"><span>${k}</span><strong>${esc(v)}</strong></div>`).join("")}

function renderAdmin(){const pending=state.applications.filter(a=>a.status==="pending"),approved=state.students.filter(s=>s.active),certs=state.students.flatMap(s=>s.certificates||[]),ranked=approved.map(s=>({s,score:bestScore(s)})).filter(x=>x.score!==null).sort((a,b)=>b.score-a.score);$("adminPendingCount").textContent=pending.length;$("adminApprovedCount").textContent=approved.length;$("adminTopStudent").textContent=ranked.length?`${ranked[0].s.fullName.split(" ")[0]} ${ranked[0].score}%`:"—";$("adminCertificateCount").textContent=certs.length;$("adminCurrentCourse").textContent=state.course.title;$("adminCurrentCourseState").textContent=state.courseClosed?"Course session is closed.":state.course.published?"Course is published for approved students.":"Course is hidden from students.";renderApplications();renderStudents();renderBuilder();renderAdminCerts();$("togglePublishBtn").textContent=state.course.published?"Hide Course":"Publish Course"}
function renderApplications() {
  $("applicationsTable").innerHTML =
    state.applications.length
      ? state.applications.map(a => `
          <article class="data-row">

            <div class="data-main">
              <strong>${esc(a.fullName)}</strong>
              <span>
                ${esc(a.email)}
                •
                ${esc(a.documentName)}
              </span>
            </div>

            <small>
              ${esc(a.nationality)}
            </small>

            <small>
              ${esc(a.status.toUpperCase())}
            </small>

            <div class="row-actions">
              ${
                a.status === "pending"
                  ? `
                    <button
                      class="approve"
                      onclick="approveApplication('${a.id}')">
                      Approve
                    </button>

                    <button
                      class="reject"
                      onclick="rejectApplication('${a.id}')">
                      Reject
                    </button>
                  `
                  : ""
              }
            </div>

          </article>
        `).join("")
      : `
          <div class="locked-card">
            <i class="fa-solid fa-inbox"></i>
            <h3>No applications yet</h3>
          </div>
        `;
}
window.approveApplication = async id => {
  const application = state.applications.find(
    a => a.id === id
  );

  if (!application) return;

  const confirmed = confirm(
    `Approve ${application.fullName} as a student?`
  );

  if (!confirmed) return;

  try {
    const {
      data,
      error
    } = await supabaseClient.functions.invoke(
      "approve-learning-application",
      {
        body: {
          application_id: id
        }
      }
    );

    if (error) {
      console.error(
        "Approval function error:",
        error
      );

      throw new Error(
        data?.error ||
        error.message ||
        "Unable to approve application."
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
        "Application approval failed."
      );
    }

    // Reload applications from Supabase
    await loadAdminApplications();

    renderAdmin();

    alert(
      data.message ||
      "Application approved successfully."
    );

  } catch (error) {
    console.error(
      "Application approval failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to approve this application."
    );
  }
};
window.rejectApplication = async id => {
  const application = state.applications.find(
    a => a.id === id
  );

  if (!application) return;

  const reason = prompt(
    "Reason for rejection:",
    "Course full / requirements not met"
  );

  if (reason === null) return;

  const cleanReason = reason.trim();

  if (!cleanReason) {
    alert("Please provide a rejection reason.");
    return;
  }

  const confirmed = confirm(
    `Reject application for ${application.fullName}?`
  );

  if (!confirmed) return;

  try {
    const {
      error
    } = await supabaseClient
      .from("learning_applications")
      .update({
        application_status: "rejected",
        rejection_reason: cleanReason,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    await loadAdminApplications();

    renderAdmin();

    alert("Application rejected successfully.");

  } catch (error) {
    console.error(
      "Application rejection failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to reject this application."
    );
  }
};

function renderStudents(){const ranked=state.students.map(s=>({s,score:bestScore(s)})).sort((a,b)=>(b.score??-1)-(a.score??-1));$("studentsTable").innerHTML=ranked.length?ranked.map((x,i)=>`<article class="data-row"><div class="data-main"><strong>${i===0&&x.score!==null?"🏆 ":""}${esc(x.s.fullName)}</strong><span>${esc(x.s.email)}</span></div><small>${x.score===null?"No mark":x.score+"%"}</small><small>${hasCert(x.s)?"Certificate awarded":"No certificate"}</small><div class="row-actions"><button class="secondary" onclick="toggleStudent('${x.s.id}')">${x.s.active?"Deactivate":"Activate"}</button></div></article>`).join(""):`<div class="locked-card"><i class="fa-solid fa-users"></i><h3>No approved students</h3></div>`}
window.toggleStudent = async id => {
  const student = state.students.find(
    s => s.id === id
  );

  if (!student) return;

  const newStatus = !student.active;

  const confirmed = confirm(
    `${newStatus ? "Activate" : "Deactivate"} ${student.fullName}?`
  );

  if (!confirmed) return;

  try {
    const { error } = await supabaseClient
      .from("learning_students")
      .update({
        active: newStatus
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    await loadAdminStudents();

    renderAdmin();

    alert(
      `Student ${newStatus ? "activated" : "deactivated"} successfully.`
    );

  } catch (error) {
    console.error(
      "Student status update failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to update student status."
    );
  }
};

function renderBuilder(){["courseTitleInput","courseSubtitleInput","courseDescriptionInput","courseSectionInput","courseSummaryInput"].forEach(()=>{});$("courseTitleInput").value=state.course.title;$("courseSubtitleInput").value=state.course.subtitle;$("courseDescriptionInput").value=state.course.description;$("courseSectionInput").value=state.course.section;$("courseSummaryInput").value=state.course.summary;adminQuestionDraft=JSON.parse(JSON.stringify(state.course.questions||[]));renderQuestionBuilder()}
function renderQuestionBuilder(){$("questionBuilder").innerHTML=adminQuestionDraft.map((q,qi)=>`<div class="question-builder-item"><label>Question ${qi+1}</label><textarea data-q="${qi}" rows="2">${esc(q.text)}</textarea>${q.answers.map((a,ai)=>`<div class="answer-grid"><input data-a="${qi}:${ai}" value="${esc(a.text)}"><label class="correct-toggle"><input type="checkbox" data-c="${qi}:${ai}" ${a.correct?"checked":""}> Correct</label></div>`).join("")}<button class="remove-q" onclick="removeQuestion(${qi})">Remove question</button></div>`).join("")}
$("addQuestionBtn").onclick=()=>{adminQuestionDraft.push({id:crypto.randomUUID(),text:"New question",answers:[{text:"Option A",correct:true},{text:"Option B",correct:false},{text:"Option C",correct:false},{text:"Option D",correct:false}]});renderQuestionBuilder()};
window.removeQuestion=i=>{adminQuestionDraft.splice(i,1);renderQuestionBuilder()};
$("saveCourseInfoBtn").onclick = async () => {
  const btn = $("saveCourseInfoBtn");

  const title =
    $("courseTitleInput").value.trim() ||
    "Untitled Course";

  const subtitle =
    $("courseSubtitleInput").value.trim();

  const description =
    $("courseDescriptionInput").value.trim();

  const sectionNumber =
    Number($("courseSectionInput").value) || 1;

  const summary =
    $("courseSummaryInput").value.trim();

  const originalText = btn.innerHTML;

  btn.disabled = true;

  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {
    if (!state.course?.id) {
      throw new Error(
        "No Supabase course was loaded."
      );
    }

    const {
      data,
      error
    } = await supabaseClient
      .from("learning_courses")
      .update({
        title,
        subtitle,
        description,
        section_number: sectionNumber,
        summary,
        updated_at: new Date().toISOString()
      })
      .eq("id", state.course.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    state.course.title =
      data.title;

    state.course.subtitle =
      data.subtitle || "";

    state.course.description =
      data.description || "";

    state.course.section =
      data.section_number || 1;

    state.course.summary =
      data.summary || "";

    renderAdmin();

    alert(
      "Course information saved successfully."
    );

  } catch (error) {
    console.error(
      "Course save failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to save course information."
    );

  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
};
$("saveQuestionsBtn").onclick = async () => {
  const btn = $("saveQuestionsBtn");

  if (!state.course?.id) {
    alert("No Supabase course was loaded.");
    return;
  }

  // Copy what the admin typed into adminQuestionDraft.
  $$("[data-q]").forEach(element => {
    const questionIndex =
      Number(element.dataset.q);

    adminQuestionDraft[questionIndex].text =
      element.value.trim();
  });

  $$("[data-a]").forEach(element => {
    const [questionIndex, answerIndex] =
      element.dataset.a
        .split(":")
        .map(Number);

    adminQuestionDraft[questionIndex]
      .answers[answerIndex]
      .text = element.value.trim();
  });

  $$("[data-c]").forEach(element => {
    const [questionIndex, answerIndex] =
      element.dataset.c
        .split(":")
        .map(Number);

    adminQuestionDraft[questionIndex]
      .answers[answerIndex]
      .correct = element.checked;
  });

  if (!adminQuestionDraft.length) {
    alert(
      "Add at least one question before saving."
    );
    return;
  }

  // Validate questions before touching Supabase.
  for (
    let i = 0;
    i < adminQuestionDraft.length;
    i++
  ) {
    const question =
      adminQuestionDraft[i];

    if (!question.text) {
      alert(
        `Question ${i + 1} cannot be empty.`
      );
      return;
    }

    if (!question.answers?.length) {
      alert(
        `Question ${i + 1} needs answers.`
      );
      return;
    }

    const emptyAnswer =
      question.answers.some(
        answer => !answer.text
      );

    if (emptyAnswer) {
      alert(
        `Complete all answers for Question ${i + 1}.`
      );
      return;
    }

    const correctAnswers =
      question.answers.filter(
        answer => answer.correct
      );

    if (correctAnswers.length !== 1) {
      alert(
        `Question ${i + 1} must have exactly one correct answer.`
      );
      return;
    }
  }

  const originalText =
    btn.innerHTML;

  btn.disabled = true;

  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {

    /*
     * -------------------------------------------------
     * 1. Remove questions deleted in the builder
     * -------------------------------------------------
     */

    const oldQuestions =
      state.course.questions || [];

    const draftQuestionIds =
      adminQuestionDraft.map(
        question => question.id
      );

    const removedQuestions =
      oldQuestions.filter(
        question =>
          question.id &&
          !draftQuestionIds.includes(
            question.id
          )
      );

    for (
      const question of removedQuestions
    ) {

      // Delete answers first.
      const {
        error: answerDeleteError
      } = await supabaseClient
        .from("learning_answers")
        .delete()
        .eq(
          "question_id",
          question.id
        );

      if (answerDeleteError) {
        throw answerDeleteError;
      }

      const {
        error: questionDeleteError
      } = await supabaseClient
        .from("learning_questions")
        .delete()
        .eq("id", question.id);

      if (questionDeleteError) {
        throw questionDeleteError;
      }
    }


    /*
     * -------------------------------------------------
     * 2. Save every question
     * -------------------------------------------------
     */

    for (
      let questionIndex = 0;
      questionIndex <
        adminQuestionDraft.length;
      questionIndex++
    ) {
      const question =
        adminQuestionDraft[
          questionIndex
        ];

      if (!question.id) {
        question.id =
          crypto.randomUUID();
      }

      const {
        error: questionError
      } = await supabaseClient
        .from("learning_questions")
        .upsert({
          id: question.id,

          course_id:
            state.course.id,

          question_text:
            question.text,

          sort_order:
            questionIndex
        });

      if (questionError) {
        throw questionError;
      }


      /*
       * -----------------------------------------------
       * 3. Remove answers deleted from this question
       * -----------------------------------------------
       */

      const oldQuestion =
        oldQuestions.find(
          item =>
            item.id === question.id
        );

      const oldAnswers =
        oldQuestion?.answers || [];

      const draftAnswerIds =
        question.answers
          .filter(answer => answer.id)
          .map(answer => answer.id);

      const removedAnswers =
        oldAnswers.filter(
          answer =>
            answer.id &&
            !draftAnswerIds.includes(
              answer.id
            )
        );

      for (
        const answer of removedAnswers
      ) {
        const {
          error: deleteError
        } = await supabaseClient
          .from("learning_answers")
          .delete()
          .eq("id", answer.id);

        if (deleteError) {
          throw deleteError;
        }
      }


      /*
       * -----------------------------------------------
       * 4. Save answers
       * -----------------------------------------------
       */

      for (
        let answerIndex = 0;
        answerIndex <
          question.answers.length;
        answerIndex++
      ) {
        const answer =
          question.answers[
            answerIndex
          ];

        if (!answer.id) {
          answer.id =
            crypto.randomUUID();
        }

        const {
          error: answerError
        } = await supabaseClient
          .from("learning_answers")
          .upsert({
            id: answer.id,

            question_id:
              question.id,

            answer_text:
              answer.text,

            is_correct:
              answer.correct === true,

            sort_order:
              answerIndex
          });

        if (answerError) {
          throw answerError;
        }
      }
    }


    /*
     * -------------------------------------------------
     * 5. Update browser state
     * -------------------------------------------------
     */

    state.course.questions =
      JSON.parse(
        JSON.stringify(
          adminQuestionDraft
        )
      );

    alert(
      "Questions saved successfully."
    );

    renderAdmin();

  } catch (error) {
    console.error(
      "Question save failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to save the questions."
    );

  } finally {
    btn.disabled = false;
    btn.innerHTML =
      originalText;
  }
};
$("togglePublishBtn").onclick = async () => {
  const btn = $("togglePublishBtn");

  if (!state.course?.id) {
    alert("No Supabase course was loaded.");
    return;
  }

  const newPublishedState =
    !state.course.published;

  const originalText =
    btn.innerHTML;

  btn.disabled = true;

  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

  try {
    const {
      data,
      error
    } = await supabaseClient
      .from("learning_courses")
      .update({
        published: newPublishedState,
        updated_at: new Date().toISOString()
      })
      .eq("id", state.course.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    state.course.published =
      data.published === true;

    renderAdmin();

  } catch (error) {
    console.error(
      "Course publish update failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to update course status."
    );

  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
};
$("closeCourseBtn").onclick = async () => {
  const btn = $("closeCourseBtn");

  if (!state.course?.id) {
    alert("No course is currently loaded.");
    return;
  }

  const confirmed = confirm(
    "Close this course and start a new blank course?"
  );

  if (!confirmed) {
    return;
  }

  const originalText = btn.innerHTML;

  btn.disabled = true;

  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Closing...';

  try {

    // 1. Close the current course.
    const {
      error: closeError
    } = await supabaseClient
      .from("learning_courses")
      .update({
        closed: true,
        published: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", state.course.id);

    if (closeError) {
      throw closeError;
    }


    // 2. Create a completely new blank course.
    const {
      data: newCourse,
      error: createError
    } = await supabaseClient
      .from("learning_courses")
      .insert({
        title: "New Course",
        subtitle: "",
        description: "",
        section_number: 1,
        summary: "",
        published: false,
        closed: false
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }


    // 3. Clear the old course from browser memory.
    state.course = {
      id: newCourse.id,

      title:
        newCourse.title,

      subtitle: "",

      description: "",

      section: 1,

      summary: "",

      published: false,

      questions: []
    };

    state.courseClosed = false;

    adminQuestionDraft = [];


    // 4. Refresh Course Builder.
    renderAdmin();

    alert(
      "Course closed. A new blank course is ready."
    );

  } catch (error) {
    console.error(
      "Course closing failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to close the course."
    );

  } finally {
    btn.disabled = false;
    btn.innerHTML =
      originalText;
  }
};

function renderAdminCerts(){const all=state.students.flatMap(s=>(s.certificates||[]).map(c=>({s,c})));$("certificateAdminList").innerHTML=all.length?all.map(({s,c})=>`<article class="certificate-card"><h3>${esc(s.fullName)}</h3><p><strong>${esc(c.certificateCode||"Pending code")}</strong> • ${esc(c.courseTitle)} • ${c.score}% • ${new Date(c.awardedAt).toLocaleDateString()}</p><button class="primary-btn" onclick="openCertificate('${s.id}','${c.id}')">Print / Save PDF</button></article>`).join(""):`<div class="locked-card"><i class="fa-solid fa-award"></i><h3>No certificates yet</h3></div>`}
window.openCertificate=(sid,cid)=>{const s=state.students.find(x=>x.id===sid),c=s?.certificates?.find(x=>x.id===cid);if(!s||!c)return;$("certificatePreview").innerHTML=`<div class="certificate-sheet"><div class="cert-brand"><span>mi</span> Print Learning</div><h2>Certificate of Completion</h2><p>This certificate is proudly awarded to</p><div class="student-name">${esc(s.fullName)}</div><p>Certificate No. <strong>${esc(c.certificateCode||"MIP-LEGACY")}</strong></p><p>for successfully completing</p><div class="cert-course">${esc(c.courseTitle)}</div><p>with a final recorded score of <strong>${c.score}%</strong>.</p><div class="cert-footer"><span>Awarded: ${new Date(c.awardedAt).toLocaleDateString()}</span><span>mi Print • Tiangmaatla Multipurpose</span></div></div>`;openModal("certificateModal")};
$("printCertificateBtn").onclick=()=>window.print();
showPublic();
