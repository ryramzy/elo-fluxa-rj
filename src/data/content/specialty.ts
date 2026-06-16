export const specialtyContent: Record<string, Record<string, { id: string; title: string; slides: string[] }>> = {
  "electrical-engineering-english": {
    "ee-01": {
      id: "ee-01",
      title: "Circuits & components vocabulary",
      slides: [
        "INTRO|||Power Up|||Welcome to Electrical Engineering English. Precision is everything when you are dealing with high voltage.|||Elo: Are you ready to charge up your vocabulary?",
        "VOCAB|||Core Components|||Resistor, Capacitor, Inductor, Diode, Transistor.|||Elo: 'Transistor' is the building block of modern electronics. How many are in your phone?",
        "CONCEPT|||Current vs Voltage|||Current (I) is measured in Amperes (Amps). Voltage (V) is measured in Volts. Resistance (R) is measured in Ohms.|||Elo: Remember Ohm's Law: V = I x R.",
        "EXAMPLE|||Describing a Circuit|||'The capacitor is wired in parallel with the resistor to filter out high-frequency noise.'|||Elo: Notice the prepositions: 'wired IN parallel WITH'.",
        "CULTURE|||The Metric System Exception|||While the US uses imperial units (inches, feet) for mechanical engineering, electrical engineering globally (including the US) uses the metric SI system (Volts, Amps, Meters).|||Elo: A rare moment of agreement!",
        "DRILL|||Translation|||Translate: 'A corrente está muito alta para este fio.'|||Elo: 'The current is too high for this wire.'",
        "ROLEPLAY|||The Lab Partner|||Your partner asks why the LED blew up.|||Elo: Explain that there was no 'resistor' in series to limit the 'current'.",
        "REVIEW|||Fully Charged|||You learned: Core components, Current vs Voltage, and parallel/series wiring.|||Elo: Solid start. Let's keep the resistance low for the next lesson."
      ]
    },
    "ee-02": {
      id: "ee-02",
      title: "Schematics & technical drawings",
      slides: [
        "INTRO|||Reading the Map|||Schematics are the universal language of EE. But you still need to explain them in English!|||Elo: Do you prefer reading schematics or breadboarding?",
        "VOCAB|||Schematic Terms|||Ground, Node, Junction, Datasheet, Breadboard, PCB (Printed Circuit Board).|||Elo: 'Datasheet' is your bible for any component.",
        "CONCEPT|||Tracing a Signal|||'The signal flows from the input stage, passes through the amplifier, and outputs to the speaker.'|||Elo: Use directional verbs like 'flows', 'passes through', and 'routes to'.",
        "EXAMPLE|||Troubleshooting from a drawing|||'Looking at the schematic, if node A is grounded, the transistor will cut off.'|||Elo: 'Cut off' means it stops conducting.",
        "CULTURE|||Standardization|||IEEE (Institute of Electrical and Electronics Engineers) sets the standards. Knowing how to read IEEE documentation is crucial.|||Elo: It's pronounced 'I-triple-E'.",
        "DRILL|||Translation|||Translate: 'Verifique o datasheet (folha de dados) para ver a voltagem máxima.'|||Elo: 'Check the datasheet for the maximum voltage.'",
        "ROLEPLAY|||The Design Review|||Your manager asks you to explain your circuit design.|||Elo: Guide them through it: 'The input signal flows through the capacitor and into the transistor...'",
        "REVIEW|||PCB Designer|||You learned: Schematic terms, signal flow, and IEEE pronunciation.|||Elo: Your technical explanations are becoming clear."
      ]
    },
    "ee-03": {
      id: "ee-03",
      title: "Safety procedures & documentation",
      slides: [
        "INTRO|||Safety First|||A misunderstanding in a high-voltage environment can be fatal. Clear communication saves lives.|||Elo: Do you always follow safety protocols, or do you take shortcuts?",
        "VOCAB|||Safety Terms|||Lockout/Tagout (LOTO), Grounding, PPE (Personal Protective Equipment), Hazard, Arc flash.|||Elo: LOTO ensures machines are turned off and locked before maintenance.",
        "CONCEPT|||The Imperative Form|||For safety rules, use direct commands (the imperative): 'Always wear safety glasses.' 'Never touch a live wire.'|||Elo: Don't use 'You should...'. Use 'Do' and 'Do not'.",
        "EXAMPLE|||Reporting an Incident|||'The circuit breaker tripped due to an overload, but no injuries were reported.'|||Elo: 'Tripped' is the exact verb for when a breaker triggers.",
        "CULTURE|||OSHA|||In the US, OSHA (Occupational Safety and Health Administration) enforces workplace safety. An OSHA violation is a serious legal issue.|||Elo: Never mess with OSHA regulations.",
        "DRILL|||Translation|||Translate: 'Aterre o equipamento antes de consertá-lo.'|||Elo: 'Ground the equipment before repairing it.'",
        "ROLEPLAY|||The Safety Briefing|||You are in charge of a lab session with new interns.|||Elo: Give them two strict safety commands using the imperative form.",
        "REVIEW|||Safety Inspector|||You learned: LOTO, PPE, hazard reporting, and OSHA.|||Elo: Everyone went home safe today."
      ]
    },
    "ee-04": {
      id: "ee-04",
      title: "Lab & testing language",
      slides: [
        "INTRO|||In the Lab|||Testing and measuring require specific verbs to describe what the instruments are doing.|||Elo: What's your favorite piece of lab equipment?",
        "VOCAB|||Lab Equipment|||Oscilloscope, Multimeter, Function generator, Soldering iron, Probes.|||Elo: We say 'solder' without the L sound! It sounds like 'sod-er'.",
        "CONCEPT|||Describing Measurements|||'The voltage spiked to 5V and then dropped.' 'The waveform is a sine wave.' 'There is a lot of noise on the line.'|||Elo: 'Spiked' means a sudden, sharp increase.",
        "EXAMPLE|||Debugging|||'I probed the VCC pin and found a short to ground.'|||Elo: A 'short circuit' is often just called a 'short'.",
        "CULTURE|||The Maker Movement|||In the US, the 'Maker' culture (DIY electronics, Arduino, Raspberry Pi) is huge and has created a casual, hobbyist vocabulary that mixes with professional EE.|||Elo: Are you a maker?",
        "DRILL|||Translation|||Translate: 'Eu preciso soldar este componente na placa.'|||Elo: 'I need to solder this component to the board.' (Remember the silent L!)",
        "ROLEPLAY|||The Broken Prototype|||Your prototype isn't working. A colleague asks what you've tested so far.|||Elo: Tell them you used the multimeter and found a 'short to ground'.",
        "REVIEW|||Lab Tech|||You learned: Oscilloscopes, soldering pronunciation, and describing spikes.|||Elo: Your prototype is working."
      ]
    },
    "ee-05": {
      id: "ee-05",
      title: "Technical presentations & reports",
      slides: [
        "INTRO|||Presenting Data|||Engineers must explain complex technical data to non-technical managers. It's a vital skill.|||Elo: Is it hard to explain your work to your family?",
        "VOCAB|||Presentation Terms|||Tolerance, Efficiency, Specifications (Specs), To mitigate interference, Feasibility.|||Elo: 'Specs' is the standard abbreviation for specifications.",
        "CONCEPT|||Explaining the 'So What?'|||Don't just read the data. Explain what it means. 'The efficiency is 95%, WHICH MEANS we will save battery life.'|||Elo: The phrase 'which means' bridges the gap between engineering and business.",
        "EXAMPLE|||Concluding a Report|||'In conclusion, the proposed design meets all safety specs and is feasible within the budget.'|||Elo: Strong, clear, and focused on the results.",
        "CULTURE|||The Whiteboard Interview|||Tech companies often use 'Whiteboard Interviews' where you must design a system on a whiteboard while explaining your thought process out loud in English.|||Elo: You have to speak AND draw at the same time!",
        "DRILL|||Translation|||Translate: 'O projeto atende a todas as especificações.'|||Elo: 'The design meets all the specs.'",
        "ROLEPLAY|||The Final Pitch|||You are presenting a new power supply design to the CEO.|||Elo: Tell them the efficiency is high, 'which means' it will save the company money.",
        "REVIEW|||Chief Engineer|||You learned: Explaining specs, using 'which means', and feasibility.|||Elo: You did the work. You've completed the EE module."
      ]
    }
  },
  "full-stack-development": {
    "fs-01": {
      id: "fs-01",
      title: "Tech team communication culture",
      slides: [
        "INTRO|||Welcome to the Matrix|||Software development is a team sport. How you communicate in Slack and GitHub defines your career.|||Elo: Are you a frontend, backend, or full-stack dev?",
        "VOCAB|||Dev Lingo|||Tech debt, Refactor, Hardcoded, Deprecated, Boilerplate.|||Elo: 'Hardcoded' means writing data directly into the source code instead of using variables/databases. It's usually bad!",
        "CONCEPT|||The Blame-Free Culture|||Modern dev teams focus on the problem, not the person. 'The server crashed because of a memory leak' NOT 'You crashed the server.'|||Elo: Use the passive voice to avoid pointing fingers.",
        "EXAMPLE|||Discussing Debt|||'If we don't refactor this spaghetti code now, the technical debt will slow down future features.'|||Elo: 'Spaghetti code' is messy, tangled code.",
        "CULTURE|||Asynchronous Work|||Remote teams work 'async'. You must write clear messages because your coworker in India might be asleep.|||Elo: Over-communicate in writing!",
        "DRILL|||Translation|||Translate: 'Esta biblioteca está obsoleta (deprecated).'|||Elo: 'This library is deprecated.'",
        "ROLEPLAY|||The Code Review|||You see a colleague hardcoded a password in the code.|||Elo: Leave a polite comment suggesting they use an environment variable instead.",
        "REVIEW|||Team Player|||You learned: Tech debt, deprecated, async culture, and blame-free language.|||Elo: Your soft skills are improving alongside your coding skills."
      ]
    },
    "fs-02": {
      id: "fs-02",
      title: "PR reviews & issue writing",
      slides: [
        "INTRO|||LGTM!|||Pull Requests (PRs) are where the real collaboration happens. Writing good PRs and Issues is an art.|||Elo: Have you ever received a mean PR review?",
        "VOCAB|||PR Acronyms|||LGTM (Looks Good To Me), WIP (Work In Progress), PR (Pull Request), QA (Quality Assurance), Nitpick (Nit).|||Elo: A 'nitpick' or 'nit' is a minor, non-blocking suggestion (like fixing a typo).",
        "CONCEPT|||Writing Good Issues|||A bug report must have: 1. Expected behavior. 2. Actual behavior. 3. Steps to reproduce.|||Elo: If you just write 'It's broken', developers will ignore you.",
        "EXAMPLE|||Reviewing Code politely|||'Great work! Just a nit: maybe we can extract this logic into a helper function? What do you think?'|||Elo: Asking it as a question ('What do you think?') softens the critique.",
        "CULTURE|||Rubber Duck Debugging|||A common practice where a dev explains their code line-by-line to a rubber duck on their desk to find the bug.|||Elo: Explaining it out loud forces your brain to slow down. Quack!",
        "DRILL|||Translation|||Translate: 'Parece bom para mim. Aprovado.'|||Elo: 'LGTM. Approved.'",
        "ROLEPLAY|||The Bug Report|||A user says the login button doesn't work.|||Elo: Write a 1-sentence issue describing the 'Steps to reproduce'.",
        "REVIEW|||Reviewer Extraordinaire|||You learned: LGTM, Nits, Steps to reproduce, and Rubber Duck debugging.|||Elo: Your PR is approved and merged."
      ]
    },
    "fs-03": {
      id: "fs-03",
      title: "Slack/Discord professional etiquette",
      slides: [
        "INTRO|||Ping Me Later|||Chat apps have replaced email for developers. The rules of engagement are different here.|||Elo: Do you use Slack or Discord at work?",
        "VOCAB|||Chat Verbs|||To ping someone, To thread a reply, To tag/mention, To hop on a call.|||Elo: 'Ping me when you are ready' means send me a quick message.",
        "CONCEPT|||The Thread|||Always reply in a 'thread' to keep the main channel clean. Don't post 5 short messages; write one structured block.|||Elo: Threading is the #1 rule of Slack etiquette.",
        "EXAMPLE|||Async Updates|||'Hey @team, I just deployed the hotfix to staging. Let me know if you see any regressions.'|||Elo: Clear, tags the right people, and asks for specific feedback.",
        "CULTURE|||The 'Hello' Problem|||Never just send 'Hello' and wait for a reply. It forces the other person to wait. Send 'Hello, I have a question about the API...'|||Elo: Give them all the context immediately.",
        "DRILL|||Translation|||Translate: 'Me dê um toque quando você terminar.'|||Elo: 'Ping me when you're done.'",
        "ROLEPLAY|||The Quick Fix|||You need 5 minutes of help from a senior dev.|||Elo: Message them: 'Hey, do you have 5 minutes to hop on a quick call?'",
        "REVIEW|||Slack Master|||You learned: Pinging, threading, and avoiding the 'Hello' problem.|||Elo: *Slack notification sound* Handled perfectly."
      ]
    },
    "fs-04": {
      id: "fs-04",
      title: "Reading & writing technical docs",
      slides: [
        "INTRO|||RTFM|||'Read The F***ing Manual'. Documentation is how knowledge survives in a tech company. You must write it well.|||Elo: Do you actually read the docs, or just copy from StackOverflow?",
        "VOCAB|||Doc Elements|||Prerequisites, Endpoint, Payload, Query parameters, Rate limiting.|||Elo: 'Prerequisites' are what you need installed BEFORE you start.",
        "CONCEPT|||Active Voice in Docs|||Docs should tell the user what to do. 'Run this command to install the package.' NOT 'This command can be run...'|||Elo: The imperative form (commands) is best for tutorials.",
        "EXAMPLE|||API Documentation|||'This endpoint requires a POST request with a JSON payload containing the user ID.'|||Elo: Extremely standard API documentation language.",
        "CULTURE|||Markdown Everywhere|||Tech docs are almost exclusively written in Markdown (.md files). Knowing Markdown formatting is a basic literacy skill for developers.|||Elo: Do you know how to make text **bold** in Markdown?",
        "DRILL|||Translation|||Translate: 'Este endpoint retorna um erro 404 se o usuário não for encontrado.'|||Elo: 'This endpoint returns a 404 error if the user is not found.'",
        "ROLEPLAY|||The README|||You built a new open-source tool.|||Elo: Write a 1-sentence instruction on how to install it using the imperative voice.",
        "REVIEW|||Technical Writer|||You learned: Endpoints, payloads, prerequisites, and active voice.|||Elo: Your documentation is clear."
      ]
    },
    "fs-05": {
      id: "fs-05",
      title: "Interviewing at English tech companies",
      slides: [
        "INTRO|||Cracking the Coding Interview|||Tech interviews are grueling. Behavioral questions, LeetCode, System Design... let's prepare.|||Elo: Have you ever done a live coding interview?",
        "VOCAB|||Interview Stages|||Phone screen, Take-home assignment, Technical interview, Culture fit, Offer stage.|||Elo: The 'Culture fit' interview checks if you are a jerk. Don't be a jerk!",
        "CONCEPT|||Thinking Out Loud|||During a coding challenge, you MUST speak your thoughts. 'I'm going to use a hash map here because the time complexity is O(1).'|||Elo: Silent coding is a guaranteed failure. They need to hear your logic.",
        "EXAMPLE|||Explaining Trade-offs|||'We could use an array, which saves memory, but a Set will give us faster lookups. I'll go with the Set.'|||Elo: Showing you know the pros and cons (trade-offs) proves you are a senior dev.",
        "CULTURE|||The FAANG Dream|||FAANG (Facebook, Amazon, Apple, Netflix, Google) or MAANG sets the standard for interviews. They care heavily about Data Structures and Algorithms (DSA).|||Elo: Time to grind LeetCode!",
        "DRILL|||Translation|||Translate: 'Qual é a complexidade de tempo deste algoritmo?'|||Elo: 'What is the time complexity of this algorithm?'",
        "ROLEPLAY|||The Algorithm|||The interviewer asks why you used a specific loop.|||Elo: Explain that you did it to 'optimize performance' and 'reduce time complexity'.",
        "REVIEW|||Hired!|||You learned: Trade-offs, thinking out loud, and interview stages.|||Elo: You passed. Welcome to Full Stack Development."
      ]
    }
  },
  "software-engineering-2026": {
    "swe-01": {
      id: "swe-01",
      title: "AI-assisted development vocabulary",
      slides: [
        "INTRO|||The New Era|||AI didn't replace developers; it gave them superpowers. Let's learn the language of AI-assisted coding.|||Elo: How often do you use Copilot or ChatGPT while coding?",
        "VOCAB|||AI Terms|||Prompt engineering, Hallucination, Context window, Fine-tuning, Code generation.|||Elo: When an AI confidently gives you a fake API endpoint, that's a 'hallucination'.",
        "CONCEPT|||Prompting as Code|||Writing good prompts is like writing code. You must be specific about the input, the output format, and the constraints.|||Elo: 'Write a React component' is bad. 'Write a functional React component using Tailwind and TypeScript, with no external dependencies' is good.",
        "EXAMPLE|||Reviewing AI Code|||'Copilot generated this boilerplate, but I had to refactor the logic because it hallucinated a variable.'|||Elo: AI is a junior developer. You are the senior reviewer.",
        "CULTURE|||10x Developer?|||AI tools have revived the myth of the '10x Developer' (someone 10 times more productive). Now, everyone is expected to be much faster.|||Elo: Efficiency is the new baseline.",
        "DRILL|||Translation|||Translate: 'A IA alucinou essa função, ela não existe.'|||Elo: 'The AI hallucinated this function, it doesn't exist.'",
        "ROLEPLAY|||The PR Comment|||A junior dev submits a PR that looks exactly like raw ChatGPT output, full of unnecessary comments.|||Elo: Tell them politely to review and 'refactor' AI-generated code before submitting.",
        "REVIEW|||Prompt Engineer|||You learned: Hallucinations, prompt engineering, and reviewing AI code.|||Elo: The AI revolution is here, and you speak its language."
      ]
    },
    "swe-02": {
      id: "swe-02",
      title: "React Native & cross-platform language",
      slides: [
        "INTRO|||Write Once, Run Anywhere|||Mobile development is dominated by cross-platform frameworks. Let's talk about building for iOS and Android simultaneously.|||Elo: Do you prefer iOS or Android?",
        "VOCAB|||Mobile Dev Terms|||Native modules, Bridge, OTA (Over The Air) updates, App bundle, TestFlight.|||Elo: 'TestFlight' is Apple's app for beta testing before public release.",
        "CONCEPT|||Platform Specifics|||Sometimes you must write platform-specific code. 'We need a custom native module for iOS to handle the push notifications.'|||Elo: The 'Bridge' is what connects JavaScript to native code.",
        "EXAMPLE|||Performance Issues|||'The app is dropping frames during the animation. We need to optimize the render cycle.'|||Elo: 'Dropping frames' makes the app look laggy and cheap.",
        "CULTURE|||The App Store Review|||Getting an app approved by Apple is notoriously difficult and arbitrary. 'We got rejected by Apple again' is a common complaint.|||Elo: Have you ever survived the App Store review process?",
        "DRILL|||Translation|||Translate: 'O aplicativo está travando no Android.'|||Elo: 'The app is crashing on Android.'",
        "ROLEPLAY|||The Release Strategy|||Your boss asks how to send an urgent bug fix without waiting for Apple's approval.|||Elo: Suggest pushing an 'OTA (Over The Air) update'.",
        "REVIEW|||Mobile Master|||You learned: Native modules, OTA updates, dropping frames, and TestFlight.|||Elo: Your app has been approved for the App Store."
      ]
    },
    "swe-03": {
      id: "swe-03",
      title: "System design discussion language",
      slides: [
        "INTRO|||Architecting the Future|||System design separates junior developers from senior architects. It's about scale, reliability, and trade-offs.|||Elo: Can you design Twitter in 45 minutes?",
        "VOCAB|||Architecture Terms|||Microservices, Load balancer, Sharding, Caching, Latency, Single point of failure.|||Elo: 'Sharding' is splitting a massive database into smaller, manageable chunks.",
        "CONCEPT|||Scaling Up vs Scaling Out|||Scaling up (Vertical) = buying a bigger server. Scaling out (Horizontal) = buying more servers and using a load balancer.|||Elo: Modern cloud systems almost always scale horizontally.",
        "EXAMPLE|||Discussing Trade-offs|||'If we use a NoSQL database, we get high scalability, but we sacrifice ACID transactions and strong consistency.'|||Elo: In system design, there are no perfect solutions, only trade-offs.",
        "CULTURE|||The 'Five Nines'|||High availability is measured in 'nines'. 99.999% uptime is the gold standard ('Five Nines'), allowing only 5 minutes of downtime per year.|||Elo: Does your code have Five Nines of reliability?",
        "DRILL|||Translation|||Translate: 'Precisamos adicionar um cache para reduzir a latência.'|||Elo: 'We need to add a cache to reduce latency.'",
        "ROLEPLAY|||The Architecture Review|||Your team wants to put everything on one giant server.|||Elo: Warn them that this creates a 'single point of failure' and suggest 'horizontal scaling'.",
        "REVIEW|||Software Architect|||You learned: Load balancers, scaling horizontally, latency, and the Five Nines.|||Elo: Your system architecture is sound."
      ]
    },
    "swe-04": {
      id: "swe-04",
      title: "DevOps & CI/CD communication",
      slides: [
        "INTRO|||Shipping Code|||Writing code is only half the battle. Getting it securely to the user is the job of DevOps.|||Elo: Do you get nervous when you deploy to production?",
        "VOCAB|||DevOps Lingo|||Pipeline, Deployment, Rollback, Staging environment, Containerization.|||Elo: A 'rollback' is reversing a bad deployment to the previous working version.",
        "CONCEPT|||Continuous Integration (CI)|||'Every time you push code, the CI pipeline automatically runs the unit tests and linters.'|||Elo: CI ensures you don't merge broken code.",
        "EXAMPLE|||The Outage|||'Production went down. We had to execute an emergency rollback to the previous container image.'|||Elo: The scariest sentence in software engineering.",
        "CULTURE|||Deploy on Fridays?|||There is a famous meme/rule in tech: 'Never deploy on a Friday'. If it breaks, you ruin your weekend.|||Elo: Unless you have a bulletproof CI/CD pipeline, respect this rule!",
        "DRILL|||Translation|||Translate: 'O pipeline falhou porque os testes quebraram.'|||Elo: 'The pipeline failed because the tests broke.'",
        "ROLEPLAY|||The Bad Push|||You merged code that caused a critical bug in production.|||Elo: Tell the DevOps engineer: 'Please initiate a rollback immediately.'",
        "REVIEW|||DevOps Pro|||You learned: Pipelines, Rollbacks, Containers, and Friday deploys.|||Elo: Deployment successful. No rollbacks needed."
      ]
    },
    "swe-05": {
      id: "swe-05",
      title: "Open source contribution English",
      slides: [
        "INTRO|||Giving Back|||Open source software (OSS) runs the internet. Contributing to it requires a specific, highly polite form of English.|||Elo: Have you ever submitted a PR to a public repo?",
        "VOCAB|||OSS Terms|||Fork, Maintainer, Contributor, Issue tracker, Upstream.|||Elo: The 'Maintainer' is the person who manages the project. Be nice to them!",
        "CONCEPT|||Polite Proposals|||Before doing massive work, open an issue to propose it. 'I was wondering if you'd be open to a PR that adds feature X?'|||Elo: Never just drop a massive PR without asking first.",
        "EXAMPLE|||Handling Rejection|||Maintainer: 'We won't be merging this as it falls outside the project's scope.' You: 'No problem, thanks for reviewing!'|||Elo: Don't take it personally. Maintainers have to say 'no' to keep the project focused.",
        "CULTURE|||Hacktoberfest|||Every October, the global dev community celebrates 'Hacktoberfest' to encourage OSS contributions. You even get a free t-shirt!|||Elo: It's a great way to practice your OSS English.",
        "DRILL|||Translation|||Translate: 'Obrigado por apontar isso, eu vou consertar na próxima revisão.'|||Elo: 'Thanks for pointing that out, I'll fix it in the next commit/revision.'",
        "ROLEPLAY|||The First PR|||You want to fix a typo in the documentation of a famous library.|||Elo: Write a short PR description: 'This PR fixes a minor typo in the README.'",
        "REVIEW|||OSS Contributor|||You learned: Maintainers, Upstream, polite proposals, and handling rejection.|||Elo: The community thanks you for your contribution."
      ]
    },
    "swe-06": {
      id: "swe-06",
      title: "Tech leadership communication",
      slides: [
        "INTRO|||Leading the Nerds|||Becoming a Tech Lead or Engineering Manager means writing less code and managing more people. Let's learn leadership English.|||Elo: Do you want to stay an individual contributor (IC) or become a manager?",
        "VOCAB|||Leadership Terms|||To unblock, To mentor, 1-on-1s, Career trajectory, Tech stack.|||Elo: 'Unblocking' a developer means removing whatever is stopping them from working.",
        "CONCEPT|||The 1-on-1 Meeting|||This is your private time with your manager. Don't just give status updates. 'I'd like to discuss my career trajectory and how I can level up to Senior.'|||Elo: You own your career, not your boss.",
        "EXAMPLE|||Shielding the Team|||'I'll handle the pushback from the product team so you guys can focus on shipping the feature.'|||Elo: A good tech lead acts as an umbrella, shielding the team from corporate rain.",
        "CULTURE|||Impostor Syndrome|||A massive phenomenon in tech where successful developers feel like frauds who will be 'found out'. Great leaders acknowledge and normalize this feeling.|||Elo: Have you ever felt impostor syndrome?",
        "DRILL|||Translation|||Translate: 'Como posso te ajudar a destravar (unblock) essa tarefa?'|||Elo: 'How can I help unblock you on this task?'",
        "ROLEPLAY|||The Mentorship|||Your junior developer is stressed and experiencing impostor syndrome.|||Elo: Reassure them that it's normal and offer to 'mentor' them on the next project.",
        "REVIEW|||Tech Lead|||You learned: Unblocking, 1-on-1s, shielding the team, and Impostor Syndrome.|||Elo: You did the work. You've completed SWE 2026."
      ]
    }
  },
  "cars-automotive-ev": {
    "car-01": {
      id: "car-01",
      title: "EV vocabulary & how they work",
      slides: [
        "INTRO|||The Electric Revolution|||Internal combustion engines are fading out. Electric Vehicles (EVs) have their own vocabulary.|||Elo: Do you think you'll ever buy an electric car?",
        "VOCAB|||EV Terms|||Battery pack, Range anxiety, Charging station, Regenerative braking, Torque.|||Elo: 'Range anxiety' is the fear that your battery will die before you reach a charger.",
        "CONCEPT|||Regenerative Braking|||When you lift your foot off the accelerator, the motor acts as a generator to slow the car and charge the battery.|||Elo: EV drivers call this 'one-pedal driving'.",
        "EXAMPLE|||Comparing Specs|||'This EV has a 300-mile range and goes from 0 to 60 in 3 seconds thanks to instant torque.'|||Elo: EVs don't have gears to shift, so the torque (acceleration power) is instant.",
        "CULTURE|||Tesla Superchargers|||Tesla built a massive proprietary charging network in the US. Now, other brands are adopting the 'NACS' (North American Charging Standard) to use it.|||Elo: It's the Apple vs USB-C battle, but for cars.",
        "DRILL|||Translation|||Translate: 'Eu estou com medo que a bateria acabe antes de chegarmos.'|||Elo: 'I have range anxiety.' (Or: I'm worried we'll run out of charge).",
        "ROLEPLAY|||The Dealership|||You are test-driving an EV. Ask the salesperson about the charging speed.|||Elo: Ask: 'How long does it take to charge from 10% to 80% at a fast charging station?'",
        "REVIEW|||Fully Charged|||You learned: Range anxiety, regenerative braking, and instant torque.|||Elo: You're ready to embrace the electric future."
      ]
    },
    "car-02": {
      id: "car-02",
      title: "Hybrid systems & the EV transition",
      slides: [
        "INTRO|||The Middle Ground|||Not ready for full electric? Hybrids bridge the gap. Let's learn the acronyms.|||Elo: What's the difference between a hybrid and a plug-in hybrid?",
        "VOCAB|||Acronyms|||ICE (Internal Combustion Engine), HEV (Hybrid Electric Vehicle), PHEV (Plug-in Hybrid), MPG (Miles Per Gallon).|||Elo: ICE is the traditional gas engine car.",
        "CONCEPT|||How PHEVs Work|||A PHEV has a larger battery you plug into the wall. It drives 30-40 miles purely on electric before the gas engine turns on.|||Elo: It's perfect for daily city commutes.",
        "EXAMPLE|||Fuel Efficiency|||'This plug-in hybrid gets 50 MPG combined, and you never have range anxiety because of the gas engine backup.'|||Elo: Americans use MPG (Miles per Gallon), not Km/L.",
        "CULTURE|||The Transition Period|||Many traditional automakers (legacy auto) are struggling to pivot from ICE to EV, facing massive restructuring costs and union battles in Detroit.|||Elo: It's a tough time for legacy auto.",
        "DRILL|||Translation|||Translate: 'Carros a combustão estão ficando obsoletos.'|||Elo: 'ICE vehicles are becoming obsolete.'",
        "ROLEPLAY|||The Debate|||A friend says EVs are bad for road trips.|||Elo: Argue that a 'PHEV' is the perfect solution to avoid 'range anxiety'.",
        "REVIEW|||Hybrid Expert|||You learned: ICE, PHEV, MPG, and legacy auto.|||Elo: You've mastered the transition vocabulary."
      ]
    },
    "car-03": {
      id: "car-03",
      title: "Modern car tech: ADAS & OTA updates",
      slides: [
        "INTRO|||Computers on Wheels|||Modern cars are just software platforms. Let's learn the tech jargon of the automotive world.|||Elo: Do you trust a car to drive itself?",
        "VOCAB|||Tech Terms|||ADAS (Advanced Driver Assistance Systems), OTA (Over The Air), Infotainment, LIDAR, Autonomy levels.|||Elo: Infotainment = Information + Entertainment (the big screen in the dashboard).",
        "CONCEPT|||Over The Air Updates|||Just like your phone, cars now get software updates via Wi-Fi. 'The new OTA update increased the battery range and added a new game to the infotainment system.'|||Elo: Tesla pioneered this; now everyone does it.",
        "EXAMPLE|||Autopilot Features|||'The ADAS uses radar and cameras for lane-keeping assist and adaptive cruise control.'|||Elo: 'Adaptive cruise control' slows down automatically if the car in front slows down.",
        "CULTURE|||Self-Driving Promises|||Elon Musk has promised fully autonomous (Level 5) self-driving cars 'next year' for a decade. The industry now accepts it's a much harder problem than anticipated.|||Elo: Will we see robotaxis in our lifetime?",
        "DRILL|||Translation|||Translate: 'O carro recebeu uma atualização de software na noite passada.'|||Elo: 'The car received an OTA update last night.'",
        "ROLEPLAY|||The Tech Support|||Your car's screen is frozen. You call customer service.|||Elo: Tell them the 'infotainment system' crashed after the recent 'OTA update'.",
        "REVIEW|||Tech Driver|||You learned: ADAS, OTA, Infotainment, and Autonomy levels.|||Elo: Your automotive vocabulary is fully updated."
      ]
    },
    "car-04": {
      id: "car-04",
      title: "Road vocabulary & driving jargon",
      slides: [
        "INTRO|||Hit the Road|||Driving in an English-speaking country requires knowing the signs, the rules, and the slang.|||Elo: Are you a calm driver or do you get road rage?",
        "VOCAB|||Road Terms|||Highway, Lane, Toll booth, Intersection, Roundabout (traffic circle), Yield.|||Elo: To 'yield' means to give the right of way to other cars.",
        "CONCEPT|||The Dashboard Warnings|||Check engine light, Low tire pressure, Empty tank, Wipers.|||Elo: The 'wipers' clear the rain off your windshield.",
        "EXAMPLE|||Directions|||'Merge onto the highway, stay in the right lane, and take exit 45.'|||Elo: To 'merge' is to join traffic smoothly.",
        "CULTURE|||Turning on Red|||In most of the US, it is legal to turn right at a red light (after stopping completely), unless a sign says 'No Turn on Red'.|||Elo: This confuses many European and South American drivers!",
        "DRILL|||Translation|||Translate: 'Use a seta antes de mudar de faixa.'|||Elo: 'Use your turn signal (or blinker) before changing lanes.'",
        "ROLEPLAY|||The Traffic Stop|||A police officer pulls you over and asks: 'Do you know why I pulled you over?'|||Elo: Politely say: 'No officer, was I speeding?'",
        "REVIEW|||Road Trip Ready|||You learned: Yielding, merging, wipers, and turning on red.|||Elo: Buckle up, you're ready for an American road trip."
      ]
    },
    "car-05": {
      id: "car-05",
      title: "Mechanics & workshop English",
      slides: [
        "INTRO|||Under the Hood|||If your car breaks down, you need to explain the problem to a mechanic without getting scammed.|||Elo: Do you know how to change a flat tire?",
        "VOCAB|||Car Parts|||Hood, Trunk, Windshield, Brake pads, Spark plugs, Transmission.|||Elo: The 'hood' is the front engine cover. The 'trunk' is the back storage.",
        "CONCEPT|||Describing Sounds|||Mechanics rely on your description. 'It's making a grinding noise when I brake.' 'There is a rattling sound under the hood.'|||Elo: Grinding (metal on metal) vs Rattling (loose pieces shaking).",
        "EXAMPLE|||The Quote|||Mechanic: 'Your brake pads are worn out, and the rotors need resurfacing. It'll be $400 for parts and labor.'|||Elo: 'Labor' is the cost of the mechanic's time.",
        "CULTURE|||The Dealership vs Independent Shop|||Dealerships (concessionárias) are notoriously expensive for repairs in the US. Many prefer trusted independent 'mom and pop' repair shops.|||Elo: Always get a second opinion on a big repair bill!",
        "DRILL|||Translation|||Translate: 'O pneu está furado e o motor está vazando óleo.'|||Elo: 'The tire is flat and the engine is leaking oil.'",
        "ROLEPLAY|||The Breakdown|||Your car won't start. You call a tow truck (guincho).|||Elo: Explain that the battery is dead and you need a 'jump start'.",
        "REVIEW|||Gearhead|||You learned: Hood, Trunk, Grinding noises, and Labor costs.|||Elo: You did the work. You've finished the Automotive track. Drive safely."
      ]
    }
  },
  "english-for-traveling": {
    "trv-01": {
      id: "trv-01",
      title: "Airports & check-in",
      slides: [
        "INTRO|||Welcome Aboard|||Airports are stressful enough. Knowing the exact vocabulary makes the process smooth.|||Elo: Do you prefer the window or the aisle seat?",
        "VOCAB|||Airport Terms|||Boarding pass, Gate, Luggage/Baggage, Carry-on, Security checkpoint, Customs.|||Elo: 'Luggage' is uncountable! Never say 'I have three luggages'. Say 'three bags' or 'three pieces of luggage'.",
        "CONCEPT|||At the Desk|||Agent: 'Are you checking any bags?' You: 'Just one. And I have one carry-on.'|||Elo: A 'carry-on' is the small bag you take onto the plane.",
        "EXAMPLE|||Security Checks|||'Please take off your shoes, empty your pockets, and put your laptops in a separate bin.'|||Elo: The TSA (Transportation Security Administration) in the US is very strict about this.",
        "CULTURE|||TSA PreCheck|||Many Americans pay for 'TSA PreCheck' to skip the regular security line and avoid taking off their shoes and belts.|||Elo: It's the ultimate airport luxury.",
        "DRILL|||Translation|||Translate: 'A que horas começa o embarque para o voo para Nova York?'|||Elo: 'What time does boarding start for the flight to New York?'",
        "ROLEPLAY|||The Heavy Bag|||The agent says: 'Your bag is overweight. There is a $50 fee.'|||Elo: Ask if you can open the bag and move some items to your 'carry-on' to avoid the fee.",
        "REVIEW|||Cleared for Takeoff|||You learned: Luggage vs bags, carry-ons, and security bins.|||Elo: Have a safe flight."
      ]
    },
    "trv-02": {
      id: "trv-02",
      title: "Hotels & accommodation",
      slides: [
        "INTRO|||Checking In|||Let's ensure you get the room you booked, and maybe a free upgrade!|||Elo: What's the most important thing for you in a hotel? Bed, shower, or breakfast?",
        "VOCAB|||Hotel Terms|||Reservation, Deposit, Amenities, Key card, Check-out time, Front desk.|||Elo: 'Amenities' are the extras: pool, gym, free Wi-Fi, etc.",
        "CONCEPT|||The Check-In Process|||Clerk: 'I need a credit card for incidentals.'|||Elo: 'Incidentals' are extra charges (room service, broken items). They block a deposit on your card just in case.",
        "EXAMPLE|||Complaining Politely|||'Excuse me, the AC in my room isn't working. Could you send maintenance or move me to another room?'|||Elo: Always start with 'Excuse me' to be polite but firm.",
        "CULTURE|||Tipping Housekeeping|||In the US, it is customary to leave a few dollars ($2-$5 per day) on the pillow or desk for the housekeeping staff when you check out.|||Elo: It's a small gesture that goes a long way.",
        "DRILL|||Translation|||Translate: 'Posso fazer o check-out mais tarde? Meu voo é só à noite.'|||Elo: 'Can I get a late check-out? My flight is only in the evening.'",
        "ROLEPLAY|||The Lost Key|||You left your key card inside your room.|||Elo: Go to the 'front desk', explain the situation, and ask for a replacement key card.",
        "REVIEW|||Checked In|||You learned: Incidentals, amenities, late check-outs, and tipping housekeeping.|||Elo: Enjoy your stay."
      ]
    },
    "trv-03": {
      id: "trv-03",
      title: "Ordering food & handling complaints",
      slides: [
        "INTRO|||Dining Out|||We covered basic restaurant vocab in Beginner, but what happens when they mess up your order?|||Elo: Are you someone who complains or just eats the wrong food in silence?",
        "VOCAB|||Dining Terms|||Tap water, On the side, Well-done/Rare, To split the bill, Doggy bag.|||Elo: A 'doggy bag' is a box to take your leftover food home. Very common in the US!",
        "CONCEPT|||Customizing Orders|||'I'll have the salad, but can I get the dressing ON THE SIDE? And no onions, please.'|||Elo: Americans customize their orders constantly. Don't be afraid to ask.",
        "EXAMPLE|||Sending Food Back|||'Excuse me, I asked for medium-rare, but this steak is well-done. Could you take it back?'|||Elo: Notice the polite phrasing. Never yell at the waiter.",
        "CULTURE|||Tap Water is Free|||In the US, 'tap water' (water from the sink) is safe, free, and served with ice immediately when you sit down. You don't have to pay for bottled water.|||Elo: Save money, drink the tap water!",
        "DRILL|||Translation|||Translate: 'Nós gostaríamos de dividir a conta, por favor.'|||Elo: 'We'd like to split the bill/check, please.'",
        "ROLEPLAY|||The Wrong Dish|||The waiter brings you chicken, but you ordered pasta.|||Elo: Politely call the waiter over and explain the mix-up.",
        "REVIEW|||Food Critic|||You learned: Tap water, dressing on the side, doggy bags, and sending food back.|||Elo: Bon appétit."
      ]
    },
    "trv-04": {
      id: "trv-04",
      title: "Emergencies & asking for help",
      slides: [
        "INTRO|||Stay Calm|||Nobody wants an emergency on vacation, but you need the vocabulary just in case.|||Elo: Let's hope you never have to use this lesson!",
        "VOCAB|||Emergency Terms|||Pickpocket, Lost passport, Embassy, Pharmacy, Prescription.|||Elo: A 'prescription' is the written note from a doctor to get medicine.",
        "CONCEPT|||Explaining Symptoms|||'I have a terrible headache', 'I feel dizzy', 'I think I have food poisoning.'|||Elo: Use 'I have' for symptoms, and 'I feel' for overall states (dizzy, nauseous).",
        "EXAMPLE|||Reporting a Crime|||'I need to report a theft. My wallet was stolen on the subway.'|||Elo: Use the passive voice ('was stolen') because you don't know who did it.",
        "CULTURE|||911 and Healthcare Costs|||In the US, the emergency number is 911. Be aware that calling an ambulance or visiting the ER is incredibly expensive without travel insurance.|||Elo: ALWAYS buy travel insurance before visiting the US.",
        "DRILL|||Translation|||Translate: 'Onde fica a farmácia mais próxima? Eu preciso de remédio para dor.'|||Elo: 'Where is the nearest pharmacy? I need painkillers.'",
        "ROLEPLAY|||The Lost Passport|||You are at the US embassy because you lost your passport.|||Elo: Explain the situation to the clerk and ask what documents you need to get a new one.",
        "REVIEW|||Safe and Sound|||You learned: Symptoms, reporting theft, and the importance of travel insurance.|||Elo: You're prepared for anything now."
      ]
    },
    "trv-05": {
      id: "trv-05",
      title: "Cultural etiquette & social cues",
      slides: [
        "INTRO|||Blending In|||The final step of traveling is not just surviving, but acting like a local. Let's talk about cultural faux pas.|||Elo: What's a social rule in Brazil that foreigners always break?",
        "VOCAB|||Etiquette Terms|||Small talk, Personal space, To wait in line, Faux pas, To tip.|||Elo: In the US, waiting in line (or 'queuing') is sacred. Never cut the line.",
        "CONCEPT|||The Apology Reflex|||If you accidentally bump into someone, or even just walk too close to them in a supermarket aisle, always say 'Excuse me' or 'Sorry'.|||Elo: Americans apologize for spatial invasions constantly.",
        "EXAMPLE|||Declining Offers|||'I'm good, thanks!' or 'I'm all set.'|||Elo: These are the most common, polite ways to say 'No thank you' to a salesperson or waiter.",
        "CULTURE|||The 'How are you' Trap (Revisited)|||Remember from Beginner: When the cashier says 'Hi, how are you?', they don't want a real answer. Say 'Good, you?', pay, and leave.|||Elo: Efficiency and friendliness combined.",
        "DRILL|||Translation|||Translate: 'Com licença, você está na fila?'|||Elo: 'Excuse me, are you in line?' (Crucial question!)",
        "ROLEPLAY|||The Supermarket|||You are blocking the aisle with your shopping cart. Someone needs to pass.|||Elo: Move your cart, apologize, and say 'Go ahead'.",
        "REVIEW|||World Traveler|||You learned: Line etiquette, the apology reflex, and declining politely.|||Elo: You did the work. You've completed the Travel module, and the entire curriculum."
      ]
    }
  },
  "usa-car-culture": {
    "usc-01": {
      id: "usc-01",
      title: "The Rise of Muscle Cars",
      slides: [
        "INTRO|||Horsepower Era|||Welcome to the golden age of American horsepower! From 1964 to 1973, Detroit auto manufacturers went wild building loud, powerful, and affordable cars.|||Elo: Do you have a favorite classic muscle car?",
        "VOCAB|||Under the Hood|||V8 Engine, Horsepower, Supercharger, Burnout, Quarter-mile, Coupe.|||Elo: A V8 has eight cylinders arranged in a V shape, producing a deep rumble.",
        "CONCEPT|||Mustang vs. Camaro|||In 1964, Ford launched the Mustang, starting the 'Pony Car' craze. Chevrolet responded with the Camaro in 1967. This legendary rivalry continues today.|||Elo: 'Pony cars' are compact, sporty muscle cars.",
        "EXAMPLE|||Slang & Cruise Night|||'We spent Saturday night cruising Woodward Ave and doing burnouts at the traffic light.'|||Elo: A 'burnout' is spinning your tires to create white smoke. Fun, but expensive for your tires!",
        "CULTURE|||The 1973 Oil Crisis|||The muscle car era ended abruptly in 1973 due to the OPEC oil embargo, which caused gas prices to skyrocket and forced manufacturers to focus on fuel economy.|||Elo: Gas went from cheap and plentiful to strictly rationed.",
        "DRILL|||Translation|||Translate: 'Este Ford Mustang clássico tem um motor V8 muito barulhento.'|||Elo: 'This classic Ford Mustang has a very loud V8 engine.'",
        "ROLEPLAY|||The Classic Car Show|||A fellow car enthusiast at a car meet asks: 'What is under the hood of your Dodge Charger?'|||Elo: Tell them it has a 'supercharged V8 engine' producing 'eight hundred horsepower'.",
        "REVIEW|||Muscle Car Expert|||You learned: V8 engine, burnouts, pony cars, and the Mustang vs Camaro rivalry.|||Elo: Great job! You are ready to rev your engine for the next lesson."
      ]
    },
    "usc-02": {
      id: "usc-02",
      title: "Hot Rods & Custom Car Styles",
      slides: [
        "INTRO|||Built, Not Bought|||Before muscle cars, young Americans in the 1930s and 40s bought cheap old cars and modified them for maximum speed. This was the birth of hot rodding.|||Elo: Have you ever customized a car, or do you prefer stock?",
        "VOCAB|||Customization Terms|||Hot rod, Souping up, Sleeper, Chopped top, Flames, Bonneville Salt Flats.|||Elo: To 'soup up' an engine means to modify it to increase horsepower.",
        "CONCEPT|||The Sleeper Car|||A 'sleeper' is a car that looks slow, stock, or boring on the outside, but has a high-performance engine underneath. It hides its speed.|||Elo: Don't judge a book by its cover, or a car by its rust!",
        "EXAMPLE|||The Salt Flats|||'Every year, hot rodders gather at the Bonneville Salt Flats in Utah to break land speed records.'|||Elo: The Salt Flats are a perfectly flat, dried-up salt lake bed, ideal for high-speed runs.",
        "CULTURE|||T-Buckets & Lead Sleds|||Different custom styles emerged. 'T-Buckets' are stripped-down Ford Model Ts, while 'Lead Sleds' are heavy 1950s cruisers with lowered, smooth bodies.|||Elo: 'Lead sled' got its name from body fillers made of lead.",
        "DRILL|||Translation|||Translate: 'Ele envenenou (modified/souped up) o motor para torná-lo mais rápido.'|||Elo: 'He souped up the engine to make it faster.'",
        "ROLEPLAY|||The Garage Talk|||Your friend shows you a rusty old station wagon but says it's extremely fast.|||Elo: Tell them: 'Wow, this station wagon is a real sleeper!'",
        "REVIEW|||Custom Builder|||You learned: Hot rods, souping up, sleepers, and the Bonneville Salt Flats.|||Elo: Excellent! Your knowledge of custom car culture is running smoothly."
      ]
    },
    "usc-03": {
      id: "usc-03",
      title: "Route 66 & Classic Road Trips",
      slides: [
        "INTRO|||The Mother Road|||Route 66 is the ultimate American highway. Established in 1926, it stretches 2,448 miles from Chicago, Illinois, to Santa Monica, California.|||Elo: Have you ever been on a road trip?",
        "VOCAB|||Road Trip Lingo|||To hit the road, Pit stop, Diner, Roadside attraction, Kitsch, Interstate.|||Elo: To 'hit the road' means to begin a journey or leave.",
        "CONCEPT|||Diners & Neon Lights|||Route 66 bypassed big cities, giving rise to unique local diners, neon-lit motels, and quirky attractions like the Cadillac Ranch.|||Elo: A 'diner' is a casual restaurant serving comfort food.",
        "EXAMPLE|||The Pit Stop|||'Let's make a quick pit stop at the next gas station to fill up the tank and stretch our legs.'|||Elo: A 'pit stop' is a short pause in a journey for food, gas, or rest.",
        "CULTURE|||The Interstate System|||In 1956, the Interstate Highway System was created. These faster, wider highways bypassed Route 66, leaving many historic towns abandoned.|||Elo: Today, Route 66 is a nostalgic tourist route.",
        "DRILL|||Translation|||Translate: 'Nós precisamos pegar a estrada antes do amanhecer.'|||Elo: 'We need to hit the road before dawn.'",
        "ROLEPLAY|||The Road Trip Planner|||Your friend wants to drive non-stop for 10 hours.|||Elo: Tell them you need to make a 'pit stop' at a 'classic diner' along Route 66.",
        "REVIEW|||Highway Cruiser|||You learned: Route 66 history, hitting the road, diners, pit stops, and interstate highways.|||Elo: Perfect. You've navigated the Mother Road successfully."
      ]
    },
    "usc-04": {
      id: "usc-04",
      title: "Lowriders & Cultural Expression",
      slides: [
        "INTRO|||Low & Slow|||In East Los Angeles during the 1940s, Mexican-American (Chicano) car culture created a unique style: lowriders. Instead of speed, they focused on elegance.|||Elo: Have you ever seen a car bounce using hydraulics?",
        "VOCAB|||Lowrider Terms|||Lowrider, Cruising, Hydraulics, Custom paint, Whittier Blvd, Chicano pride.|||Elo: 'Cruising' is driving slowly down a street to show off your car and socialize.",
        "CONCEPT|||Hydraulic Suspension|||Lowrider owners installed aircraft hydraulic pumps to raise and lower their cars, bypassing California laws against extremely lowered cars.|||Elo: This turned cars into interactive art that can dance!",
        "EXAMPLE|||Whittier Boulevard|||'Whittier Boulevard in East LA is the historic heart of Sunday night lowrider cruising.'|||Elo: Cruising Whittier Boulevard was a major community gathering event.",
        "CULTURE|||Chicano Art on Wheels|||Lowriders are famous for multi-layered candy paint, hand-painted pinstripes, wire wheels, and plush velvet interiors, representing Chicano identity.|||Elo: They are rolling canvases of community pride.",
        "DRILL|||Translation|||Translate: 'O lowrider azul usou o sistema hidráulico para pular.'|||Elo: 'The blue lowrider used the hydraulics to bounce (or jump).'",
        "ROLEPLAY|||The Lowrider Meet|||A lowrider builder shows you their intricate custom paint job.|||Elo: Express your admiration: 'This custom paint job is stunning, it really shows your Chicano pride.'",
        "REVIEW|||Lowrider Connoisseur|||You learned: Cruising, hydraulics, Whittier Blvd, and Chicano car art.|||Elo: Incredible! You've completed the American Car Culture course. Drive with pride!"
      ]
    }
  },
  "medical-english": {
    "med-01": {
      id: "med-01",
      title: "Medical Abbreviations & Terminology",
      slides: [
        "INTRO|||Clinical Notation|||Welcome to Medical English. As a healthcare professional, mastering clinical abbreviations and patient-facing terminology is crucial for clear and safe communication.|||Elo: Are you ready to dive into the hospital wards?",
        "VOCAB|||Prescription Codes|||qd (once daily), bid (twice daily), tid (three times daily), PO (by mouth), PRN (as needed).|||Elo: These abbreviations come from Latin, but they are the standard in US medical records.",
        "CONCEPT|||OTC vs. Prescription|||Medications are split into OTC (Over-The-Counter) which require no prescription (e.g. aspirin), and Rx (Prescription) drugs which require a doctor's order.|||Elo: 'Rx' is the standard abbreviation for prescription.",
        "EXAMPLE|||Directives|||'Give 2 tablets PO tid PRN for pain.'|||Elo: This translates to: 'Give 2 tablets by mouth three times daily as needed for pain.'",
        "CULTURE|||Patient-Centered Language|||In the US, doctors avoid dense medical jargon when speaking to patients. We use 'high blood pressure' instead of 'hypertension', and 'kidney failure' instead of 'renal insufficiency'.|||Elo: This is called 'health literacy' translation.",
        "DRILL|||Translation|||Translate: 'Tome esta medicação duas vezes ao dia conforme necessário.'|||Elo: 'Take this medication twice daily as needed.' (Or: PO bid PRN).",
        "ROLEPLAY|||The Patient Consultation|||A patient asks if they need a prescription for ibuprofen.|||Elo: Explain that ibuprofen is available 'over-the-counter' (OTC) in lower doses, so no prescription is needed.",
        "REVIEW|||Medical Terminology|||You learned: Latin prescription codes (qd, bid, PRN), OTC vs Rx, and patient-centered language.|||Elo: Outstanding! Let's move to critical care."
      ]
    },
    "med-02": {
      id: "med-02",
      title: "PICU & NICU Critical Care",
      slides: [
        "INTRO|||Pediatric & Neonatal Intensive Care|||Critical care units require high precision. PICU (Pediatric ICU) treats children, while NICU (Neonatal ICU) cares for newborns, especially premature babies.|||Elo: Have you ever worked in an intensive care setting?",
        "VOCAB|||Intensive Care Terms|||Premature (preemie), Incubator, Ventilator, Intubation, Vitals, Line (IV).|||Elo: A 'preemie' is the casual word nurses and parents use for a premature baby.",
        "CONCEPT|||Monitoring & Alarm Fatigue|||In PICU/NICU, continuous monitoring of vitals (heart rate, oxygen saturation) is constant. Staff must battle 'alarm fatigue' (becoming desensitized to frequent monitor alerts).|||Elo: Alarm fatigue is a serious safety concern in hospitals.",
        "EXAMPLE|||Reporting Vitals|||'The neonate is stable on the ventilator, heart rate is 140, oxygen saturation is holding at 96%.'|||Elo: 'Holding at' means remaining constant.",
        "CULTURE|||Family-Centered Care|||NICUs in the US emphasize family-centered care, encouraging 'kangaroo care' (skin-to-skin contact between parents and preemies) to promote healing.|||Elo: Skin-to-skin contact has proven clinical benefits.",
        "DRILL|||Translation|||Translate: 'O bebê prematuro está respirando sozinho sem o ventilador.'|||Elo: 'The premature baby (or preemie) is breathing on their own without the ventilator.'",
        "ROLEPLAY|||The Nurse Handover|||You are handing over a NICU patient to the next shift.|||Elo: Report that the baby is in the 'incubator' and their 'vitals are stable'.",
        "REVIEW|||Critical Care|||You learned: PICU/NICU definitions, ventilator vocabulary, preemie care, and alarm fatigue.|||Elo: Excellent. Your clinical communication is top-tier."
      ]
    },
    "med-03": {
      id: "med-03",
      title: "Clinical Nursing Practice",
      slides: [
        "INTRO|||Frontline Healthcare|||Nurses are the backbone of patient care. Effective nursing communication requires empathy, clear instructions, and precise coordination.|||Elo: Nursing requires a perfect blend of technical skill and bedside manner.",
        "VOCAB|||Nursing Terms|||Bedside manner, Triage, Charting, Shift change, IV drip, Discharge.|||Elo: 'Bedside manner' is the way medical professionals interact with patients (compassion, tone).",
        "CONCEPT|||The SBAR Protocol|||US nursing uses SBAR (Situation, Background, Assessment, Recommendation) to communicate patient status to doctors quickly and clearly.|||Elo: SBAR ensures crucial details are never missed during high-stress moments.",
        "EXAMPLE|||Patient Assessment|||'The patient is complaining of acute abdominal pain. Vitals are stable, but pain is 8 out of 10.'|||Elo: Pain is always assessed on a scale from 1 to 10.",
        "CULTURE|||The Nursing Shortage|||The US faces a severe nursing shortage, leading to high nurse-to-patient ratios and a large reliance on travel nurses (temporary contract nurses).|||Elo: Travel nurses earn high wages but move every few months.",
        "DRILL|||Translation|||Translate: 'Eu preciso verificar seus sinais vitais e trocar seu soro (IV).'|||Elo: 'I need to check your vitals and change your IV.'",
        "ROLEPLAY|||The Bedside Check|||Introduce yourself to a new patient and explain you are going to take their vitals.|||Elo: Say: 'Hi, I'm your nurse, and I'm going to take your vitals now.'",
        "REVIEW|||Clinical Nursing|||You learned: Bedside manner, triage, charting, SBAR protocol, and discharge procedures.|||Elo: Great job! You speak like a seasoned nursing professional."
      ]
    },
    "med-04": {
      id: "med-04",
      title: "Hospital Administration & Management",
      slides: [
        "INTRO|||Hospital Operations|||Managing a hospital involves balancing clinical quality, patient safety, financial budgets, and staff schedules. Let's learn administration English.|||Elo: Hospital managers coordinate complex organizations.",
        "VOCAB|||Admin Lingo|||Understaffed, Bed capacity, Patient turnover, Compliance, Overhead, Staff burnout.|||Elo: 'Bed capacity' is the maximum number of patients a hospital can accommodate.",
        "CONCEPT|||Throughput & Efficiency|||Hospital managers track 'patient throughput' - the flow of patients from admission to discharge. High throughput minimizes wait times in the ER.|||Elo: Efficient throughput is critical for emergency room safety.",
        "EXAMPLE|||Meeting Discussion|||'We are currently understaffed in the ER, which is slowing down patient turnover and increasing wait times.'|||Elo: 'Patient turnover' is the rate at which beds are freed up.",
        "CULTURE|||Joint Commission Accreditation|||Hospitals in the US must be accredited by 'The Joint Commission'. Their surprise inspections check compliance with strict quality standards.|||Elo: A Joint Commission audit causes immense stress for managers!",
        "DRILL|||Translation|||Translate: 'A capacidade de leitos está cheia devido ao surto de gripe.'|||Elo: 'The bed capacity is full due to the flu outbreak.'",
        "ROLEPLAY|||The Staffing Meeting|||Your hospital department is experiencing high staff burnout and is understaffed.|||Elo: Tell the board: 'We are understaffed, which is leading to severe staff burnout.'",
        "REVIEW|||Healthcare Manager|||You learned: Bed capacity, patient throughput, compliance, and Joint Commission audits.|||Elo: You did the work. You've completed the Medical English course!"
      ]
    }
  },
  "law-enforcement": {
    "law-01": {
      id: "law-01",
      title: "Miranda Rights & Police Encounters",
      slides: [
        "INTRO|||Rights in Conflict|||Welcome to Legal English. We begin with constitutional protections during police encounters, a key topic in both law enforcement and daily rights.|||Elo: Miranda rights are based on the Fifth and Sixth Amendments.",
        "VOCAB|||Enforcement Terms|||Miranda rights, Probable cause, Right to remain silent, Self-incrimination, Search warrant.|||Elo: Police must have 'probable cause' to arrest someone or get a 'search warrant'.",
        "CONCEPT|||The Miranda Warning|||'You have the right to remain silent. Anything you say can and will be used against you in a court of law...'|||Elo: This warning protects citizens from self-incrimination.",
        "EXAMPLE|||Invoking Rights|||'I am invoking my right to remain silent and I want to speak to a lawyer.'|||Elo: You must state these desires clearly; silence alone does not invoke the right.",
        "CULTURE|||The Bill of Rights|||The Fourth Amendment protects against unreasonable searches and seizures, which is a heavily litigated topic in American criminal defense.|||Elo: If police search without a warrant or consent, evidence may be excluded.",
        "DRILL|||Translation|||Translate: 'Qualquer coisa que você disser pode ser usada contra você no tribunal.'|||Elo: 'Anything you say can be used against you in court.'",
        "ROLEPLAY|||The Police Stop|||An officer asks to search your car trunk. You want to decline.|||Elo: Say politely: 'Officer, I do not consent to a search.'",
        "REVIEW|||Rights Advocate|||You learned: Miranda warning, self-incrimination, probable cause, and search warrants.|||Elo: Excellent. You understand the foundations of police encounters."
      ]
    },
    "law-02": {
      id: "law-02",
      title: "Civil Litigation & Case Prep",
      slides: [
        "INTRO|||Civil Disputes|||Civil litigation is the process of resolving private legal disputes through the court system, involving lawsuits, case prep, and negotiations.|||Elo: Most civil cases in the US settle before trial.",
        "VOCAB|||Litigation Terms|||Plaintiff, Defendant, Lawsuit, Deposition, Discovery phase, Damages.|||Elo: 'Discovery' is the phase where both sides exchange evidence before trial.",
        "CONCEPT|||Case Preparation & Deposition|||During case prep, lawyers conduct depositions (oral testimonies under oath outside court) to lock in witness statements.|||Elo: A witness cannot easily change their story at trial after a deposition.",
        "EXAMPLE|||Discussing a Settlement|||'If the defendant offers reasonable damages during mediation, we can avoid a costly trial.'|||Elo: 'Damages' refers to monetary compensation.",
        "CULTURE|||Class Action Lawsuits|||In the US, 'Class Action' lawsuits allow a large group of people harmed by the same product or company to sue together as a single group.|||Elo: These lawsuits can result in millions of dollars in damages.",
        "DRILL|||Translation|||Translate: 'O autor (plaintiff) abriu um processo contra a empresa por perdas e danos.'|||Elo: 'The plaintiff filed a lawsuit against the company for damages.'",
        "ROLEPLAY|||The Legal Consultation|||A client wants to sue their employer. Explain the first step.|||Elo: Tell them: 'First, we will file a lawsuit and begin the discovery phase.'",
        "REVIEW|||Litigator|||You learned: Plaintiff, Defendant, depositions, discovery phase, and class actions.|||Elo: Great work. You are mastering case preparation language."
      ]
    },
    "law-03": {
      id: "law-03",
      title: "The US Jury Trial System",
      slides: [
        "INTRO|||Trial by Jury|||The Sixth and Seventh Amendments guarantee the right to a trial by jury. A jury consists of ordinary citizens who decide the final verdict.|||Elo: Have you ever served on a jury?",
        "VOCAB|||Jury Terms|||Jury selection (Voir dire), Juror, Verdict, Beyond a reasonable doubt, Unanimous.|||Elo: In criminal cases, the jury's verdict must usually be unanimous.",
        "CONCEPT|||The Burden of Proof|||In criminal cases, the prosecution must prove guilt 'beyond a reasonable doubt'. In civil cases, it is a 'preponderance of the evidence' (more likely than not).|||Elo: 'Beyond a reasonable doubt' is a much higher standard of proof.",
        "EXAMPLE|||Jury Selection|||'During voir dire, the defense attorney dismissed three potential jurors due to conflict of interest.'|||Elo: 'Voir dire' is pronounced 'vwahr deer'.",
        "CULTURE|||Jury Duty|||U.S. citizens receive jury summonses in the mail. Serving is a legal obligation ('jury duty'). Many try to get excused, but it is a vital civic role.|||Elo: Employers must allow employees time off for jury duty.",
        "DRILL|||Translation|||Translate: 'O júri chegou a um veredito unânime de inocente.'|||Elo: 'The jury reached a unanimous verdict of not guilty.'",
        "ROLEPLAY|||The Trial Strategy|||You are advising a co-counsel on how to convince the jury.|||Elo: Tell them: 'We must prove our case beyond a reasonable doubt to convince the jury.'",
        "REVIEW|||Trial Lawyer|||You learned: Voir dire, jury duty, verdicts, and burden of proof standards.|||Elo: Brilliant. You are ready to present in court."
      ]
    },
    "law-04": {
      id: "law-04",
      title: "Courtroom Hearings & Advocacy",
      slides: [
        "INTRO|||Before the Bench|||Not all law is played out in front of a jury. Hearings before a judge decide motions, evidence admissibility, and sentencing.|||Elo: Courtroom hearings require formal, persuasive advocacy.",
        "VOCAB|||Hearing Terms|||Your Honor, Objection, Overruled, Sustained, Motion, Admissible evidence.|||Elo: Address the judge as 'Your Honor' in the courtroom.",
        "CONCEPT|||Objects & Rulings|||When an opposing lawyer asks an improper question, you say 'Objection!'. The judge rules 'Sustained' (witness cannot answer) or 'Overruled' (witness must answer).|||Elo: Speed is critical when objecting in hearings.",
        "EXAMPLE|||Making a Motion|||'Your Honor, I file a motion to dismiss the case based on inadmissible evidence.'|||Elo: A 'motion' is a formal request to the judge to make a ruling.",
        "CULTURE|||Contempt of Court|||Behaving disrespectfully or disobeying a judge's orders can lead to being cited for 'Contempt of Court', which can result in immediate fines or jail time.|||Elo: Courtrooms maintain a very strict decorum.",
        "DRILL|||Translation|||Translate: 'Objeção, Meritíssimo! A prova não é admissível.'|||Elo: 'Objection, Your Honor! The evidence is not admissible.'",
        "ROLEPLAY|||The Motion Hearing|||Present a request to the judge to exclude certain evidence.|||Elo: Say: 'Your Honor, I file a motion to exclude this evidence because it was obtained illegally.'",
        "REVIEW|||Courtroom Advocate|||You learned: Objections, sustained/overruled rulings, motions, and addressing the judge.|||Elo: You did the work. You've completed the Legal English course!"
      ]
    }
  }
};
