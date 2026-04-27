/**
 * Question bank for Junior Cloud Engineer Assessment (AWS CCP Level)
 * Correct answers are stored server-side only and NEVER sent to the client.
 */

const questions = [
  // ===== STANDARD MCQs (1-15) =====
  {
    id: 1,
    type: "mcq",
    question: "Which AWS service is used to host static websites with high availability and low latency?",
    options: {
      A: "Amazon EC2",
      B: "Amazon S3 with CloudFront",
      C: "AWS Lambda",
      D: "Amazon RDS"
    },
    correct: "B"
  },
  {
    id: 2,
    type: "mcq",
    question: "What does the AWS Shared Responsibility Model define?",
    options: {
      A: "AWS is responsible for everything in the cloud",
      B: "The customer is responsible for security of the cloud infrastructure",
      C: "AWS manages security OF the cloud; customers manage security IN the cloud",
      D: "Security responsibilities are optional for both parties"
    },
    correct: "C"
  },
  {
    id: 3,
    type: "mcq",
    question: "Which AWS service provides a managed relational database?",
    options: {
      A: "Amazon DynamoDB",
      B: "Amazon RDS",
      C: "Amazon S3",
      D: "AWS CloudFormation"
    },
    correct: "B"
  },
  {
    id: 4,
    type: "mcq",
    question: "What is the primary purpose of Amazon CloudWatch?",
    options: {
      A: "Managing DNS records",
      B: "Monitoring and observability of AWS resources",
      C: "Deploying containerized applications",
      D: "Managing user permissions"
    },
    correct: "B"
  },
  {
    id: 5,
    type: "mcq",
    question: "Which pricing model offers the highest discount for a predictable workload?",
    options: {
      A: "On-Demand Instances",
      B: "Spot Instances",
      C: "Reserved Instances (3-year, all upfront)",
      D: "Dedicated Hosts"
    },
    correct: "C"
  },
  {
    id: 6,
    type: "mcq",
    question: "What is Amazon VPC used for?",
    options: {
      A: "Sending email notifications",
      B: "Creating isolated virtual networks in the AWS cloud",
      C: "Storing objects in the cloud",
      D: "Running serverless functions"
    },
    correct: "B"
  },
  {
    id: 7,
    type: "mcq",
    question: "Which AWS service is a fully managed NoSQL database?",
    options: {
      A: "Amazon Aurora",
      B: "Amazon Redshift",
      C: "Amazon DynamoDB",
      D: "Amazon RDS"
    },
    correct: "C"
  },
  {
    id: 8,
    type: "mcq",
    question: "What does IAM stand for in AWS?",
    options: {
      A: "Internet Access Management",
      B: "Identity and Access Management",
      C: "Integrated Application Monitoring",
      D: "Infrastructure as Management"
    },
    correct: "B"
  },
  {
    id: 9,
    type: "mcq",
    question: "Which service would you use to distribute traffic across multiple EC2 instances?",
    options: {
      A: "Amazon Route 53",
      B: "AWS CloudTrail",
      C: "Elastic Load Balancing (ELB)",
      D: "Amazon SQS"
    },
    correct: "C"
  },
  {
    id: 10,
    type: "mcq",
    question: "What is the AWS Free Tier?",
    options: {
      A: "A paid subscription for startups",
      B: "A set of AWS services available at no cost within certain usage limits",
      C: "A premium support plan",
      D: "An enterprise licensing agreement"
    },
    correct: "B"
  },
  {
    id: 11,
    type: "mcq",
    question: "Which AWS service provides serverless compute?",
    options: {
      A: "Amazon EC2",
      B: "AWS Fargate",
      C: "AWS Lambda",
      D: "Amazon Lightsail"
    },
    correct: "C"
  },
  {
    id: 12,
    type: "mcq",
    question: "What is the purpose of Amazon Route 53?",
    options: {
      A: "Load balancing",
      B: "DNS web service and domain registration",
      C: "Content delivery",
      D: "Database migration"
    },
    correct: "B"
  },
  {
    id: 13,
    type: "mcq",
    question: "Which storage class in S3 is most cost-effective for infrequently accessed data?",
    options: {
      A: "S3 Standard",
      B: "S3 Intelligent-Tiering",
      C: "S3 Standard-IA",
      D: "S3 One Zone-IA"
    },
    correct: "C"
  },
  {
    id: 14,
    type: "mcq",
    question: "What does AWS CloudFormation do?",
    options: {
      A: "Monitors application performance",
      B: "Provisions and manages AWS infrastructure using templates",
      C: "Provides a content delivery network",
      D: "Manages container orchestration"
    },
    correct: "B"
  },
  {
    id: 15,
    type: "mcq",
    question: "Which AWS support plan includes a Technical Account Manager (TAM)?",
    options: {
      A: "Basic",
      B: "Developer",
      C: "Business",
      D: "Enterprise"
    },
    correct: "D"
  },

  // ===== SCENARIO-BASED MCQs (16-20) =====
  {
    id: 16,
    type: "scenario",
    question: "A startup is launching a new web application that expects unpredictable traffic spikes during marketing campaigns. They need to minimize costs while ensuring the application remains available. Which combination of AWS services would be MOST appropriate?",
    options: {
      A: "EC2 Reserved Instances with a fixed Auto Scaling group",
      B: "EC2 Auto Scaling with On-Demand instances behind an Application Load Balancer",
      C: "A single large EC2 Dedicated Host",
      D: "AWS Outposts with on-premises servers"
    },
    correct: "B"
  },
  {
    id: 17,
    type: "scenario",
    question: "Your company stores sensitive customer data in Amazon S3. A compliance audit requires that all data be encrypted at rest and that access logs be maintained. Which steps should you take?",
    options: {
      A: "Enable S3 default encryption and turn on S3 server access logging",
      B: "Use EC2 instance store volumes for encryption",
      C: "Store data in DynamoDB instead since it's automatically compliant",
      D: "Enable CloudFront caching to encrypt data in transit only"
    },
    correct: "A"
  },
  {
    id: 18,
    type: "scenario",
    question: "A development team needs to deploy a containerized microservices application. They want to avoid managing the underlying server infrastructure. Which AWS service should they use?",
    options: {
      A: "Amazon EC2 with Docker installed manually",
      B: "Amazon ECS with AWS Fargate",
      C: "AWS Elastic Beanstalk with a single Docker container",
      D: "Amazon S3 with static hosting"
    },
    correct: "B"
  },
  {
    id: 19,
    type: "scenario",
    question: "Your application running on EC2 instances in a private subnet needs to download software updates from the internet, but should NOT be directly accessible from the internet. What should you configure?",
    options: {
      A: "Attach a public IP to each EC2 instance",
      B: "Place instances in a public subnet with a security group",
      C: "Use a NAT Gateway in a public subnet",
      D: "Create an internet gateway and attach it directly to the private subnet"
    },
    correct: "C"
  },
  {
    id: 20,
    type: "scenario",
    question: "A company wants to migrate a legacy on-premises Oracle database to AWS with minimal code changes. They also want to reduce licensing costs over time. What is the recommended migration strategy?",
    options: {
      A: "Use AWS DMS to migrate directly to DynamoDB",
      B: "Lift-and-shift to Amazon RDS for Oracle first, then re-platform to Amazon Aurora PostgreSQL",
      C: "Rewrite the entire application to use Amazon S3",
      D: "Use AWS Snowball to transfer the database files to S3"
    },
    correct: "B"
  }
];

/**
 * Returns questions WITHOUT correct answers (safe for client)
 */
function getClientQuestions() {
  return questions.map(({ correct, ...rest }) => rest);
}

/**
 * Returns the answer key (server-side only)
 */
function getAnswerKey() {
  const key = {};
  questions.forEach(q => {
    key[q.id] = q.correct;
  });
  return key;
}

/**
 * Grades a submission and returns detailed results
 * @param {Object} answers - { questionId: selectedOption }
 */
function gradeSubmission(answers) {
  const answerKey = getAnswerKey();
  let score = 0;
  const totalQuestions = questions.length;
  const breakdown = [];

  questions.forEach(q => {
    const userAnswer = answers[q.id] || answers[String(q.id)] || null;
    const isCorrect = userAnswer === q.correct;
    if (isCorrect) score++;

    breakdown.push({
      id: q.id,
      type: q.type,
      question: q.question,
      userAnswer,
      correctAnswer: q.correct,
      isCorrect
    });
  });

  const percentage = Math.round((score / totalQuestions) * 100);
  let band;
  if (percentage >= 80) band = "Strong";
  else if (percentage >= 60) band = "متوسط (Average)";
  else band = "ضعيف (Weak)";

  return {
    score,
    totalQuestions,
    percentage,
    band,
    breakdown
  };
}

module.exports = { getClientQuestions, getAnswerKey, gradeSubmission, questions };
