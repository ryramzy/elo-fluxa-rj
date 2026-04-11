export interface LessonContent {
  hook: string;
  sections: {
    title: string;
    content: string;
  }[];
  vocabularyBox: {
    term: string;
    definition: string;
    whenToUse: string;
  }[];
  culturalNote?: string;
  endCTA?: {
    message: string;
    whatsappMessage: string;
  };
}

export const lessonContent: Record<string, Record<string, LessonContent>> = {
  'business-english': {
    'lesson-1': {
      hook: "In Brazil, a kiss on the cheek is normal. In America, that same gesture in a business meeting could cost you the job.",
      sections: [
        {
          title: "The American Handshake",
          content: "The handshake is your first impression in American business culture. It needs to be firm (not crushing), brief (2-3 seconds), and accompanied by direct eye contact. A weak handshake signals lack of confidence, while avoiding eye contact can be interpreted as dishonesty. Americans make split-second judgments based on this simple gesture. Practice with colleagues until it feels natural - your career depends on it."
        },
        {
          title: "'How are you?' is Not a Question",
          content: "When an American says 'How are you?', they are not asking about your emotional state. This is a greeting, like 'hello' in Portuguese. The correct response is always positive and brief: 'Fine, thanks! And you?' or 'Great, how about you?' Never say you're tired, stressed, or having a bad day - this is considered inappropriate oversharing in professional contexts. Save real emotions for close friends, not business interactions."
        },
        {
          title: "First Names Immediately",
          content: "Americans use first names immediately in business, even with CEOs. Using 'Mr.' or 'Mrs.' creates distance and can be seen as cold or overly formal. Call your boss 'John' and your client 'Sarah' unless they specifically ask you to use a title. This informality doesn't mean disrespect - it's the American way of showing equality and approachability. Brazilians often struggle with this, but adapting is crucial for fitting in."
        }
      ],
      vocabularyBox: [
        {
          term: "Nice to meet you",
          definition: "Standard introduction phrase for first meetings",
          whenToUse: "Only when meeting someone for the first time"
        },
        {
          term: "Good to see you",
          definition: "Friendly greeting for people you've met before",
          whenToUse: "When encountering colleagues or acquaintances again"
        },
        {
          term: "I've heard great things about you",
          definition: "Professional compliment showing you're informed",
          whenToUse: "When meeting important contacts or potential employers"
        },
        {
          term: "Thanks for having me",
          definition: "Polite expression when visiting someone's office",
          whenToUse: "When arriving for meetings at someone else's workplace"
        },
        {
          term: "Looking forward to working with you",
          definition: "Professional closing expressing enthusiasm",
          whenToUse: "At the end of job interviews or new business relationships"
        }
      ],
      culturalNote: "The 30-second rule - Americans decide if they like you in the first 30 seconds. This lesson is about winning those 30 seconds."
    }
  },
  'sports-english': {
    'lesson-1': {
      hook: "The NBA is watched in 215 countries. But most fans outside the US miss 40% of what's being said. This course fixes that.",
      sections: [
        {
          title: "The Court",
          content: "Understanding basketball court geography is essential. The 'paint' is the painted area near the basket - it's where most scoring happens. The 'three-point line' creates shots worth three points. The 'free throw line' is where players shoot unopposed after fouls. 'Half court' divides the court - teams switch sides after halftime. These terms are used constantly during game commentary."
        },
        {
          title: "The 5 Positions",
          content: "PG (Point Guard) is the team's quarterback - they run the offense. SG (Shooting Guard) is typically the best shooter. SF (Small Forward) is versatile - scores and defends. PF (Power Forward) plays near the basket, strong rebounder. Center (C) is the tallest player, dominates the paint. Understanding these roles helps you follow strategy discussions and player analysis."
        },
        {
          title: "Rules That Confuse Non-Americans",
          content: "The 'shot clock' gives teams 24 seconds to shoot or lose possession. 'Traveling' is taking too many steps without dribbling - Brazilians often get called for this. 'Goaltending' is blocking a shot that's on its way down. 'Flagrant fouls' are violent or unsportsmanlike fouls resulting in free throws and possession. These rules create the fast-paced American basketball style."
        }
      ],
      vocabularyBox: [
        {
          term: "And-one",
          definition: "Fouled while scoring, gets one free throw",
          whenToUse: "When a player makes a basket while being fouled"
        },
        {
          term: "Posterized",
          definition: "Dunked on so hard it's worthy of a poster",
          whenToUse: "After an especially powerful dunk over a defender"
        },
        {
          term: "Brick",
          definition: "A bad shot that hits the rim hard and misses",
          whenToUse: "When someone takes a terrible shot"
        },
        {
          term: "Dime",
          definition: "A perfect assist pass",
          whenToUse: "When a player makes an exceptional pass for a score"
        },
        {
          term: "In the paint",
          definition: "Inside the painted area near the basket",
          whenToUse: "Describing action close to the basket"
        },
        {
          term: "Triple-double",
          definition: "10+ in three categories (points, rebounds, assists)",
          whenToUse: "When a player achieves double digits in three stats"
        },
        {
          term: "Buzzer beater",
          definition: "Shot made just as time expires",
          whenToUse: "For shots at the end of quarters or games"
        },
        {
          term: "Buckets",
          definition: "Another word for scoring points",
          whenToUse: "General term for making baskets"
        }
      ]
    }
  },
  'hiphop-culture': {
    'lesson-1': {
      hook: "1973. South Bronx, New York. An 18-year-old Jamaican immigrant throws a party. He calls himself DJ Kool Herc. Nothing is ever the same again.",
      sections: [
        {
          title: "The South Bronx in 1973",
          content: "The Bronx was burning. Economic collapse, gang violence, and government neglect created a vacuum of opportunity. Buildings were abandoned, schools were failing, and young people had nowhere to go. Hip hop wasn't born in a studio - it was born in this desperation. Block parties became escape, creativity became survival, and a new culture emerged from the ashes. Understanding this context is essential to understanding hip hop's power and authenticity."
        },
        {
          title: "The Four Elements",
          content: "Hip hop culture has four pillars: DJing (the foundation), MCing (rapping), B-boying (breakdancing), and graffiti art. DJ Kool Herc pioneered the 'break' - looping instrumental sections that made people dance. Grandmaster Flash invented scratching. These weren't just technical innovations - they were the sound of marginalized youth claiming their voice. Today, you see these elements everywhere: in streaming algorithms, dance competitions, and street art worldwide."
        },
        {
          title: "Why Hip Hop English is Different",
          content: "AAVE (African American Vernacular English) is not 'slang' or 'incorrect English' - it's a complete linguistic system with its own grammar, history, and cultural rules. When we learn hip hop English, we're learning a dialect that has shaped global culture. Words like 'cool,' 'fresh,' 'dope,' and 'lit' all originated in Black communities. Learning this language respectfully means understanding its roots and giving credit where it's due. This isn't about appropriation - it's about appreciation and understanding."
        }
      ],
      vocabularyBox: [
        {
          term: "Bars",
          definition: "Rap lyrics, lines of a verse",
          whenToUse: "Discussing rap lyrics or songwriting quality"
        },
        {
          term: "Flow",
          definition: "The rhythm and style of rap delivery",
          whenToUse: "Describing how a rapper delivers their lyrics"
        },
        {
          term: "Spit",
          definition: "To rap or perform lyrics",
          whenToUse: "When someone is about to rap or perform"
        },
        {
          term: "Cypher",
          definition: "A circle of rappers taking turns freestyling",
          whenToUse: "Describing informal rap battles or sessions"
        },
        {
          term: "Sample",
          definition: "A musical clip reused in a new song",
          whenToUse: "Talking about how producers create beats"
        },
        {
          term: "Break",
          definition: "The instrumental section DJs loop for dancing",
          whenToUse: "Discussing DJ techniques or dance music"
        }
      ],
      culturalNote: "Learning hip hop English means learning its culture first. We don't just use the words - we understand where they come from."
    }
  },
  'medical-english': {
    'lesson-1': {
      hook: "Brazilian doctors are brilliant. But in an international conference, on a US residency application, or with an English-speaking patient - vocabulary is the difference between competent and outstanding.",
      sections: [
        {
          title: "Hospital Departments",
          content: "American hospitals use abbreviations that sound like alphabet soup. ER (Emergency Room) is where critical cases go first. ICU (Intensive Care Unit) is for critically ill patients. OR (Operating Room) is where surgeries happen. CCU (Cardiac Care Unit) specializes in heart conditions. NICU (Neonatal Intensive Care Unit) is for newborns. PACU (Post-Anesthesia Care Unit) is where patients recover after surgery. These acronyms are used constantly in medical conversations and charts."
        },
        {
          title: "The Medical Team Hierarchy",
          content: "The American medical hierarchy differs from Brazil's. 'Attending' is the lead doctor responsible for patient care and teaching. 'Resident' is a doctor who has graduated medical school and is in specialty training (3-7 years). 'Intern' is a first-year resident. 'Fellow' is a doctor training in a subspecialty after residency. 'NP' (Nurse Practitioner) and 'PA' (Physician Assistant) are mid-level providers with expanded responsibilities. Understanding these roles is crucial for effective communication in American healthcare settings."
        },
        {
          title: "Equipment Vocabulary",
          content: "Medical equipment terms are used daily. 'IV' (intravenous line) delivers fluids and medications. 'Foley' is a urinary catheter. 'Crash cart' contains emergency resuscitation equipment. 'Defibrillator' delivers electrical shocks to restart hearts. 'Ventilator' helps patients breathe. 'Central line' is an IV placed in large veins for long-term treatment. 'Intubate' means inserting a breathing tube. 'Discharge' means releasing a patient from the hospital. These terms are essential for clear communication in emergency situations."
        }
      ],
      vocabularyBox: [
        {
          term: "ER",
          definition: "Emergency Room - Pronto Socorro",
          whenToUse: "Referring to emergency medical care"
        },
        {
          term: "ICU",
          definition: "Intensive Care Unit - UTI",
          whenToUse: "Discussing critical care patients"
        },
        {
          term: "Attending",
          definition: "Lead doctor responsible for patient care",
          whenToUse: "Referring to the primary treating physician"
        },
        {
          term: "Resident",
          definition: "Doctor in post-graduate training",
          whenToUse: "Talking about doctors in training programs"
        },
        {
          term: "IV",
          definition: "Intravenous line - acesso venoso",
          whenToUse: "Discussing medication or fluid administration"
        },
        {
          term: "Crash cart",
          definition: "Emergency resuscitation equipment",
          whenToUse: "In emergency medical situations"
        },
        {
          term: "Intubate",
          definition: "Insert breathing tube for ventilation",
          whenToUse: "In critical care or emergency contexts"
        },
        {
          term: "Discharge",
          definition: "Release patient from hospital",
          whenToUse: "When patients leave medical care"
        }
      ]
    }
  },
  'study-abroad': {
    'lesson-1': {
      hook: "Every year, thousands of Brazilians fail to get into their dream university abroad - not because they aren't smart enough, but because they chose the wrong exam.",
      sections: [
        {
          title: "TOEFL: The American Standard",
          content: "TOEFL (Test of English as a Foreign Language) is American-made and computer-based. It's primarily required by US and Canadian universities. The test scores from 0-120, with four sections: Reading (60-80 minutes), Listening (60-90 minutes), Speaking (20 minutes), and Writing (50 minutes). The speaking section uses a microphone - you talk to a computer. TOEFL focuses on academic English and campus situations. Most Brazilian students find the computer-based format familiar and the scoring straightforward."
        },
        {
          title: "IELTS: The Global Alternative",
          content: "IELTS (International English Language Testing System) is British and offers both paper and computer versions. It's accepted worldwide, including UK, Australia, and increasingly US schools. IELTS uses a 0-9 band system for each section (Reading, Writing, Listening, Speaking) and an overall band score. There are two types: Academic (for university admissions) and General Training (for immigration/work). The speaking test is face-to-face with an examiner - many Brazilians prefer this human interaction."
        },
        {
          title: "How to Decide",
          content: "The decision framework is simple: If your target is primarily US/Canada, choose TOEFL. If you're applying to UK, Australia, or multiple countries, IELTS gives more flexibility. Consider your test-taking style - if you prefer computer interfaces and want faster results, TOEFL is better. If you want face-to-face speaking tests and are comfortable with paper tests, IELTS might suit you. Check your target universities' specific requirements - some accept both, others prefer one. Don't waste months preparing for the wrong test."
        }
      ],
      vocabularyBox: [
        {
          term: "Inference",
          definition: "Conclusion based on evidence, not explicitly stated",
          whenToUse: "In reading comprehension and critical thinking"
        },
        {
          term: "Main idea",
          definition: "Central point or primary message of a passage",
          whenToUse: "Reading comprehension and academic writing"
        },
        {
          term: "Tone",
          definition: "Author's attitude toward the subject matter",
          whenToUse: "Analyzing texts and understanding writer's perspective"
        },
        {
          term: "Paraphrase",
          definition: "Restate information in different words",
          whenToUse: "Writing tasks and avoiding plagiarism"
        },
        {
          term: "Thesis statement",
          definition: "Main argument of an essay or research paper",
          whenToUse: "Academic writing and essay organization"
        },
        {
          term: "Integrated task",
          definition: "Combine reading, listening, and writing skills",
          whenToUse: "TOEFL writing section and academic assignments"
        }
      ]
    }
  },
  'law-enforcement': {
    'lesson-1': {
      hook: "American police is nothing like the Brazilian system. There is no single polícia federal that controls everything. There are over 18,000 separate law enforcement agencies in the US.",
      sections: [
        {
          title: "Three Levels of Law Enforcement",
          content: "Local police include city police departments and county sheriff's offices. They handle local crimes, traffic, and community policing. State police (like highway patrol) enforce state laws and patrol highways. Federal agencies have specific jurisdictions: FBI handles federal crimes, DEA enforces drug laws, ATF deals with alcohol, tobacco, firearms, US Marshals protect federal courts, and Secret Service protects the President and investigates financial crimes. Each agency has limited authority - they can't just operate anywhere."
        },
        {
          title: "Jurisdiction: The Boundaries of Power",
          content: "Jurisdiction determines where and what an officer can enforce. A city cop cannot make arrests outside their city limits unless in 'hot pursuit.' State police operate statewide but can't enforce local city ordinances. Federal agencies only investigate federal crimes - they don't handle traffic stops or local theft. When crimes cross jurisdictional lines, agencies must cooperate or determine which has primary authority. This complex system prevents any single agency from having too much power."
        },
        {
          title: "Chain of Command",
          content: "Police departments follow military-style hierarchies. Officer is the entry-level rank. Detective investigates crimes (requires experience). Sergeant supervises officers. Lieutenant manages sergeants. Captain oversees divisions. Chief of Police leads the entire department. Sheriffs are elected officials who run county jails. Federal agencies have different ranks but similar structures. Understanding this hierarchy is crucial for knowing who has authority in different situations."
        }
      ],
      vocabularyBox: [
        {
          term: "Jurisdiction",
          definition: "Legal authority in a specific geographic area",
          whenToUse: "Discussing which agency has authority"
        },
        {
          term: "Precinct",
          definition: "Local police station and its patrol district",
          whenToUse: "Referring to police organizational structure"
        },
        {
          term: "Beat",
          definition: "An officer's regular patrol area",
          whenToUse: "Describing police patrol assignments"
        },
        {
          term: "Dispatch",
          definition: "Central communication center coordinating officers",
          whenToUse: "Talking about police communication systems"
        },
        {
          term: "APB",
          definition: "All Points Bulletin - alert to all officers",
          whenToUse: "When police broadcast urgent information"
        },
        {
          term: "Booking",
          definition: "Formal recording of an arrest and processing",
          whenToUse: "During arrest procedures and jail intake"
        },
        {
          term: "Miranda rights",
          definition: "Rights read upon arrest (right to remain silent, lawyer)",
          whenToUse: "During arrest situations and legal procedures"
        },
        {
          term: "10-4",
          definition: "Radio code meaning 'message received'",
          whenToUse: "Police radio communications"
        }
      ]
    }
  }
};
