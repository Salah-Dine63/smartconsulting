import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Replace each DRIVE_FILE_ID_X with the actual Google Drive file ID
// To get the ID: right-click video in Drive → Share → Copy link
// Link looks like: https://drive.google.com/file/d/THIS_IS_THE_ID/view?usp=sharing
async function main() {
    const course = await prisma.course.upsert({
        where: { id: '1' },
        update: {
            modules: JSON.stringify([
                {
                    title: "Module 1: Foundations of Generative and Agentic AI",
                    videoUrl: "https://drive.google.com/file/d/1iruC9qrqa1hyZmhGrC4UKT9dV1JVYQ6z/view?usp=drive_link",
                    description: "An introduction to the course and an overview of generative and agentic AI concepts that will shape modern business."
                },
                {
                    title: "Module 2: Introduction to Generative AI",
                    videoUrl: "",
                    description: "Deep dive into how generative AI models work, their capabilities, and how to apply them in enterprise contexts."
                },
                {
                    title: "Module 3: Exploring Multimodal AI and Language Interaction",
                    videoUrl: "https://drive.google.com/file/d/13M1Nb7jdN5XoIBZIsxis9tiwsZjJKtz_/view?usp=drive_link",
                    description: "Understand how AI systems process text, images, and audio together to enable richer business workflows."
                },
                {
                    title: "Module 4: Real-World Multimodal AI Overview",
                    videoUrl: "https://drive.google.com/file/d/12f6BALeWPwKeSvpv8EiHFV3kvyFexlhJ/view?usp=drive_link",
                    description: "Practical case studies showing how multimodal AI is deployed across industries to solve real business challenges."
                },
                {
                    title: "Module 5: Model Optimization Techniques",
                    videoUrl: "https://drive.google.com/file/d/1eAhewVgkdUjX4hN852Ot5BdsjgRmzm5u/view?usp=drive_link",
                    description: "Learn fine-tuning, quantization, and other techniques to make AI models faster and cheaper for your use case."
                },
                {
                    title: "Module 6: AI Distillation — Smarter Efficiency",
                    videoUrl: "https://drive.google.com/file/d/13M1Nb7jdN5XoIBZIsxis9tiwsZjJKtz_/view?usp=drive_link",
                    description: "Explore knowledge distillation to compress large models into smaller, deployment-ready versions without sacrificing performance."
                }
            ])
        },
        create: {
            id: '1',
            title: 'Generative AI for Business Automation',
            description: 'A comprehensive 6-week online journey designed exclusively for business leaders to master LLMs and intelligent workflow automation.',
            price: 1999,
            modules: JSON.stringify([
                {
                    title: "Module 1: Foundations of Generative and Agentic AI",
                    videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_1/preview",
                    description: "An introduction to the course and an overview of generative and agentic AI concepts that will shape modern business."
                },
                {
                    title: "Module 2: Introduction to Generative AI",
                    videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_2/preview",
                    description: "Deep dive into how generative AI models work, their capabilities, and how to apply them in enterprise contexts."
                },
                {
                    title: "Module 3: Exploring Multimodal AI and Language Interaction",
                    videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_3/preview",
                    description: "Understand how AI systems process text, images, and audio together to enable richer business workflows."
                },
                {
                    title: "Module 4: Real-World Multimodal AI Overview",
                    videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_4/preview",
                    description: "Practical case studies showing how multimodal AI is deployed across industries to solve real business challenges."
                },
                {
                    title: "Module 5: Model Optimization Techniques",
                    videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_5/preview",
                    description: "Learn fine-tuning, quantization, and other techniques to make AI models faster and cheaper for your use case."
                },
                {
                    title: "Module 6: AI Distillation — Smarter Efficiency",
                    videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_6/preview",
                    description: "Explore knowledge distillation to compress large models into smaller, deployment-ready versions without sacrificing performance."
                }
            ])
        },
    })

    console.log('Seeded course:', course.title)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
