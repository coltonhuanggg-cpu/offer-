import { Student, Application, Task, TaskStatus, ParsedOfferData, OfferStatus, OfferType } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'offerflow_students',
  APPLICATIONS: 'offerflow_applications',
  TASKS: 'offerflow_tasks',
};

// --- Helpers ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const load = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API ---

export const getStudents = (): Student[] => load<Student>(STORAGE_KEYS.STUDENTS);
export const getApplications = (): Application[] => load<Application>(STORAGE_KEYS.APPLICATIONS);
export const getTasks = (): Task[] => load<Task>(STORAGE_KEYS.TASKS);

export const getApplicationsForStudent = (studentId: string): Application[] => {
  return getApplications().filter(app => app.student_id === studentId);
};

export const getTasksForApplication = (appId: string): Task[] => {
  return getTasks().filter(task => task.application_id === appId);
};

// Core Business Logic: Processing a Parsed Offer
export const processParsedOffer = (data: ParsedOfferData): { success: boolean, message: string, studentId: string } => {
  if (!data.studentName || !data.university) {
    return { success: false, message: '信息不完整（未找到学生姓名或学校名称）', studentId: '' };
  }

  const students = getStudents();
  let applications = getApplications();
  let tasks = getTasks();

  // 1. Find or Create Student
  let student = students.find(s => s.name.toLowerCase() === data.studentName?.toLowerCase());
  let isNewStudent = false;
  
  if (!student) {
    student = {
      student_id: generateId(),
      name: data.studentName,
      consultant_name: '未分配',
      notes: '系统自动通过 PDF 解析创建',
    };
    students.push(student);
    isNewStudent = true;
  }

  // 2. Find or Create Application
  // Logic: Match Student ID + University (Fuzzy) + Program (Fuzzy)
  // For simplicity here, we match exactly on Uni, loosely on Program if it exists
  let appIndex = applications.findIndex(a => 
    a.student_id === student!.student_id && 
    a.university.toLowerCase() === data.university!.toLowerCase()
  );

  let app: Application;

  const mapOfferStatus = (type: string | null): OfferStatus => {
    if (!type) return OfferStatus.NONE;
    if (type.toLowerCase().includes('reject')) return OfferStatus.REJECT;
    if (type.toLowerCase().includes('waitlist')) return OfferStatus.WAITLIST;
    return OfferStatus.OFFER;
  };

  const mapOfferType = (type: string | null): OfferType => {
    if (!type) return OfferType.UNKNOWN;
    if (type.toLowerCase().includes('unconditional')) return OfferType.UNCONDITIONAL;
    if (type.toLowerCase().includes('conditional')) return OfferType.CONDITIONAL;
    return OfferType.UNKNOWN;
  };

  const newAppData: Partial<Application> = {
    offer_status: mapOfferStatus(data.offerType),
    offer_type: mapOfferType(data.offerType),
    offer_date: data.offerDate || new Date().toISOString().split('T')[0],
    deposit_amount: data.depositAmount || undefined,
    deposit_deadline: data.depositDeadline || undefined,
    tasks_to_do: data.nextSteps || [],
    raw_pdf_text: data.keySentences || '',
    school_id_ref: data.schoolId || undefined,
    last_updated_timestamp: Date.now(),
  };

  if (appIndex >= 0) {
    // Update existing
    app = { ...applications[appIndex], ...newAppData };
    // Only update program if it was generic before
    if (data.program) app.program = data.program;
    applications[appIndex] = app;
  } else {
    // Create new
    app = {
      application_id: generateId(),
      student_id: student.student_id,
      university: data.university,
      program: data.program || '通用申请',
      offer_status: OfferStatus.NONE,
      offer_type: OfferType.UNKNOWN,
      tasks_to_do: [],
      last_updated_timestamp: Date.now(),
      ...newAppData
    };
    applications.push(app);
  }

  // 3. Auto-Generate Tasks
  // Rule A: If Conditional, add tasks for conditions
  if (data.offerType === 'Conditional' && data.conditions) {
    data.conditions.forEach(cond => {
      // Check for duplicates
      const exists = tasks.some(t => t.application_id === app.application_id && t.task_description.includes(cond));
      if (!exists) {
        tasks.push({
          task_id: generateId(),
          application_id: app.application_id,
          task_description: `满足录取条件: ${cond}`,
          status: TaskStatus.PENDING,
          deadline: undefined, // Usually conditions coincide with start term
        });
      }
    });
  }

  // Rule B: If Deposit Deadline exists, create urgent task
  if (data.depositDeadline) {
    const desc = `缴纳押金 (${data.depositAmount || '金额待定'})`;
    const exists = tasks.some(t => t.application_id === app.application_id && t.task_description.includes('缴纳押金'));
    if (!exists) {
      tasks.push({
        task_id: generateId(),
        application_id: app.application_id,
        task_description: desc,
        deadline: data.depositDeadline,
        status: TaskStatus.PENDING,
      });
    }
  }

  // Save everything
  save(STORAGE_KEYS.STUDENTS, students);
  save(STORAGE_KEYS.APPLICATIONS, applications);
  save(STORAGE_KEYS.TASKS, tasks);

  return { 
    success: true, 
    message: isNewStudent ? '新学生档案已创建，Offer 信息已录入。' : '现有学生申请记录已更新。',
    studentId: student.student_id
  };
};

export const updateTaskStatus = (taskId: string, status: TaskStatus) => {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.task_id === taskId);
  if (idx >= 0) {
    tasks[idx].status = status;
    save(STORAGE_KEYS.TASKS, tasks);
  }
};