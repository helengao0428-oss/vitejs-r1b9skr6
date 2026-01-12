🎄 Interactive 3D Christmas Tree (Web Graphics Project)
📌 Project Overview
This is a self-initiated interactive 3D web project developed to explore the intersection of AI Computer Vision and Real-time 3D Rendering. The project features a high-fidelity Christmas tree that responds dynamically to user hand gestures captured via a webcam.

While the project serves as a creative holiday greeting, it was primarily built as a technical challenge to demonstrate proficiency in integrating complex software libraries, managing real-time data streams, and deploying a cloud-based CI/CD pipeline.

🚀 Live Demo
🔗 [View the Live Project here](https://warm-mousse-110d9b.netlify.app/)

(Note: Please allow camera access. Open your palm to scatter the particles; close your fist to reform the tree.)

💝 The Inspiration (Origin)
The project originated as a personalized digital Christmas card for a friend, Vandy. The interface features the message "Merry Christmas, Vandy" to maintain the warmth of the original gift. My goal was to transform a traditional 2D greeting into an immersive, interactive experience that leverages modern web technologies.

🛠️ Tech Stack & Tools
3D Framework: React Three Fiber (Three.js abstraction for React)

AI Vision: MediaPipe Hands (Machine learning for real-time hand tracking)

Environment: StackBlitz (Browser-based IDE)

Version Control: Git & GitHub

CI/CD: Netlify (Automated deployment pipeline)

Logic Optimization: AI-Assisted Development (Leveraging Large Language Models for 3D math and denoising logic)

✨ Key Technical Features
Hand Gesture Recognition: Implemented real-time Euclidean distance calculation between hand landmarks (Thumb Tip and Index Finger Tip) to trigger state changes.

Denoising & Hysteresis Logic: Designed a custom thresholding mechanism (Hysteresis) to filter out camera sensor noise, preventing "flickering" when the hand is at the boundary of a trigger point.

Advanced Rendering: Utilized InstancedMesh to efficiently render 2,000 highly reflective 3D spheres (baubles) with metallic gold and festive red textures, maintaining 60 FPS performance.

Post-Processing: Integrated a Cinematic Bloom effect and Vignette to enhance the visual luxury and holiday atmosphere.

💡 IS Insights & Personal Growth
As an aspiring Information Systems (IS) student, this project allowed me to apply theoretical concepts to a practical system:

System Integration: Bridged hardware input (Webcam) with software logic (MediaPipe) and visual output (Three.js), a core competency in IS.

DevOps Practice: Gained hands-on experience in the Continuous Deployment lifecycle—connecting GitHub to Netlify to automate the build process whenever code is updated.

Problem Solving: Addressed challenges in data jittering and Linux-based file system sensitivity (case-sensitivity) during the deployment phase.

📂 Project Structure
/src/App.tsx - Main application logic, MediaPipe integration, and state latching.

/src/Experience.tsx - 3D scene architecture, particle interpolation, and procedural geometry.

/index.html - Entry point and CDN management for external AI libraries.

/vite.config.ts - Build configuration and base path mapping for production.

Created by Gao Hok Ming (Helen) Year 3 Undergraduate, HKUST | Aspiring Information Systems Student