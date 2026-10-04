/**
 * Free self-check quizzes, one per concern on the home page. Public, no
 * login. Shared by the quiz UI (client) and the results API (server), so
 * scoring and safety checks run the same on both sides.
 *
 * Not a diagnostic tool; results say how much something seems to be
 * weighing on someone and point them to support.
 */

export type Kind =
  | "scale" | "yn" | "text" | "duration" | "since" | "impact" | "frequency"
  | "nights" | "recency" | "satisfaction" | "time" | "trend" | "safety";

export type Question = { q: string; k: Kind; rev?: 1; noscore?: 1; flag?: "medical" | "harm" };
export type Insight = { title: string; detail: string };
export type Concern = {
  slug: string;
  chip: string; // name used in CONCERNS / the home page chips
  title: string;
  intro: string;
  questions: Question[];
  fallback: { causes: Insight[]; steps: Insight[] };
};

/** Answer options per kind. `v` is 0..1 (how much it points to difficulty); null = not scored. */
export const OPTIONS: Record<Exclude<Kind, "text">, { l: string; v: number | null }[]> = {
  scale: [
    { l: "Never", v: 0 }, { l: "Sometimes", v: 1 / 3 }, { l: "Often", v: 2 / 3 }, { l: "Almost always", v: 1 },
  ],
  yn: [{ l: "No", v: 0 }, { l: "A little", v: 0.5 }, { l: "Yes", v: 1 }],
  duration: [
    { l: "Less than 2 weeks", v: 0 }, { l: "2 weeks to a month", v: 0.25 }, { l: "1 to 6 months", v: 0.5 },
    { l: "6 months to a year", v: 0.75 }, { l: "More than a year", v: 1 },
  ],
  since: [
    { l: "In the last month", v: null }, { l: "1 to 6 months ago", v: null }, { l: "6 to 12 months ago", v: null }, { l: "More than a year ago", v: null },
  ],
  recency: [
    { l: "In the last month", v: null }, { l: "1 to 6 months ago", v: null }, { l: "6 to 12 months ago", v: null }, { l: "More than a year ago", v: null },
  ],
  impact: [{ l: "Not at all", v: 0 }, { l: "A little", v: 1 / 3 }, { l: "Quite a bit", v: 2 / 3 }, { l: "A lot", v: 1 }],
  frequency: [
    { l: "Rarely", v: 0 }, { l: "About once a month", v: 0.25 }, { l: "About once a week", v: 0.5 },
    { l: "Several times a week", v: 0.75 }, { l: "Every day", v: 1 },
  ],
  nights: [{ l: "0 to 1", v: 0 }, { l: "2 to 3", v: 1 / 3 }, { l: "4 to 5", v: 2 / 3 }, { l: "6 to 7", v: 1 }],
  satisfaction: [
    { l: "Very satisfied", v: 0 }, { l: "Somewhat satisfied", v: 1 / 3 }, { l: "Somewhat dissatisfied", v: 2 / 3 }, { l: "Very dissatisfied", v: 1 },
  ],
  time: [{ l: "Hardly any", v: 0 }, { l: "Less than an hour", v: 1 / 3 }, { l: "1 to 3 hours", v: 2 / 3 }, { l: "More than 3 hours", v: 1 }],
  trend: [{ l: "Less intense", v: 0 }, { l: "About the same", v: 0.5 }, { l: "More intense", v: 1 }],
  safety: [{ l: "No", v: null }, { l: "Sometimes, or I'm not sure", v: null }, { l: "Yes", v: null }],
};

/** An answer is an option index, or text for open questions ("" = skipped). */
export type Answer = number | string;

export const CONCERN_QUIZZES: Concern[] = [
 {
  "slug": "anxiety",
  "chip": "Anxiety",
  "title": "Anxiety",
  "questions": [
   {
    "q": "Do you frequently feel worried or anxious even when there is no immediate danger?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to control or stop your worrying?",
    "k": "scale"
   },
   {
    "q": "Do you often expect something bad to happen?",
    "k": "scale"
   },
   {
    "q": "Do you feel restless, on edge, or unable to relax?",
    "k": "scale"
   },
   {
    "q": "Do you experience racing or repetitive thoughts?",
    "k": "scale"
   },
   {
    "q": "Do you find yourself overthinking situations repeatedly?",
    "k": "scale"
   },
   {
    "q": "Do you avoid situations because you expect something might go wrong?",
    "k": "scale"
   },
   {
    "q": "Do you experience physical symptoms such as a racing heart, sweating, trembling, or stomach discomfort when anxious?",
    "k": "scale"
   },
   {
    "q": "Does anxiety make it difficult for you to concentrate?",
    "k": "scale"
   },
   {
    "q": "Does anxiety interfere with your sleep?",
    "k": "scale"
   },
   {
    "q": "Do you frequently seek reassurance from others?",
    "k": "scale"
   },
   {
    "q": "Do you worry excessively about your health or safety?",
    "k": "scale"
   },
   {
    "q": "Do you feel anxious in social situations?",
    "k": "scale"
   },
   {
    "q": "Do you feel overwhelmed by everyday responsibilities?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to make decisions because you worry about making the wrong choice?",
    "k": "scale"
   },
   {
    "q": "Has anxiety affected your studies or work?",
    "k": "yn"
   },
   {
    "q": "Has anxiety affected your relationships?",
    "k": "yn"
   },
   {
    "q": "How long have you been experiencing these concerns?",
    "k": "duration"
   },
   {
    "q": "How much does anxiety interfere with your daily life?",
    "k": "impact"
   },
   {
    "q": "What situation or concern is currently causing you the most anxiety?",
    "k": "text"
   }
  ],
  "intro": "Worry that won't switch off, a racing mind, a body that stays on edge.",
  "fallback": {
   "causes": [
    {
     "title": "A mind stuck in threat mode",
     "detail": "When worry has had a long run, the brain starts treating everyday uncertainty as danger, so it keeps scanning for what might go wrong."
    },
    {
     "title": "Avoidance and reassurance loops",
     "detail": "Avoiding situations or seeking reassurance brings quick relief but teaches your brain the worry was right, so it comes back stronger."
    }
   ],
   "steps": [
    {
     "title": "Schedule a worry window",
     "detail": "Give worries 15 minutes at a set time each day, and postpone them until then."
    },
    {
     "title": "Slow your breathing",
     "detail": "Breathe in for 4, out for 6, for two minutes when you notice your body on edge."
    },
    {
     "title": "Take one small step toward something you avoid",
     "detail": "Pick the easiest version and do it, noticing that the feared outcome usually doesn't come."
    }
   ]
  }
 },
 {
  "slug": "depression",
  "chip": "Depression",
  "title": "Depression",
  "questions": [
   {
    "q": "Have you been feeling sad, empty, or emotionally low recently?",
    "k": "yn"
   },
   {
    "q": "Have you lost interest in activities you previously enjoyed?",
    "k": "yn"
   },
   {
    "q": "Do you frequently feel tired or lacking in energy?",
    "k": "scale"
   },
   {
    "q": "Have you noticed changes in your sleep?",
    "k": "yn"
   },
   {
    "q": "Have you noticed changes in your appetite or eating habits?",
    "k": "yn"
   },
   {
    "q": "Do you find it difficult to concentrate or make decisions?",
    "k": "scale"
   },
   {
    "q": "Do you frequently feel hopeless about the future?",
    "k": "scale"
   },
   {
    "q": "Do you feel excessively guilty or blame yourself for things?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you are not good enough?",
    "k": "scale"
   },
   {
    "q": "Have you been withdrawing from friends or family?",
    "k": "yn"
   },
   {
    "q": "Do everyday activities feel unusually difficult?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to get started with tasks?",
    "k": "scale"
   },
   {
    "q": "Have your studies or work performance been affected?",
    "k": "yn"
   },
   {
    "q": "Have your relationships been affected by how you have been feeling?",
    "k": "yn"
   },
   {
    "q": "Do you feel emotionally numb or disconnected?",
    "k": "scale"
   },
   {
    "q": "How long have you been experiencing these changes?",
    "k": "duration"
   },
   {
    "q": "Have these feelings been present most days?",
    "k": "yn"
   },
   {
    "q": "How significantly are these feelings affecting your daily life?",
    "k": "impact"
   },
   {
    "q": "What has been the biggest change in your mood or behaviour recently?",
    "k": "text"
   },
   {
    "q": "Have you had thoughts of hurting yourself, ending your life, or feeling that you would be better off dead?",
    "k": "safety"
   }
  ],
  "intro": "Low mood, low energy, losing interest in things that used to matter.",
  "fallback": {
   "causes": [
    {
     "title": "Exhaustion of your emotional reserves",
     "detail": "Long stretches of stress, loss or loneliness can drain the systems that drive motivation and pleasure."
    },
    {
     "title": "A withdrawal cycle",
     "detail": "Doing less and seeing people less is understandable when you're low, but it removes the small things that usually lift mood."
    }
   ],
   "steps": [
    {
     "title": "Plan one small, doable activity a day",
     "detail": "A short walk, a shower, a call. Action often comes before motivation, not after."
    },
    {
     "title": "Keep a steady sleep and meal routine",
     "detail": "Regular rhythms give your mood a steadier base."
    },
    {
     "title": "Tell one person how you've been",
     "detail": "Letting someone in, even briefly, reduces the weight of carrying it alone."
    }
   ]
  }
 },
 {
  "slug": "stress",
  "chip": "Stress",
  "title": "Stress",
  "questions": [
   {
    "q": "Do you currently feel overwhelmed by the demands placed on you?",
    "k": "scale"
   },
   {
    "q": "Do you feel under constant pressure?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to relax after completing your responsibilities?",
    "k": "scale"
   },
   {
    "q": "Do you frequently think about your responsibilities even when you are supposed to be resting?",
    "k": "scale"
   },
   {
    "q": "Do you feel mentally exhausted?",
    "k": "scale"
   },
   {
    "q": "Do you become irritated more easily when under pressure?",
    "k": "scale"
   },
   {
    "q": "Have you noticed changes in your sleep because of stress?",
    "k": "yn"
   },
   {
    "q": "Have you noticed changes in your appetite because of stress?",
    "k": "yn"
   },
   {
    "q": "Do you experience headaches, muscle tension, stomach discomfort, or similar symptoms during stressful periods?",
    "k": "scale"
   },
   {
    "q": "Do you struggle to concentrate when stressed?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you have too many responsibilities to manage?",
    "k": "scale"
   },
   {
    "q": "Do you have difficulty saying no to additional responsibilities?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you have enough emotional support?",
    "k": "scale",
    "rev": 1
   },
   {
    "q": "Has stress affected your relationships?",
    "k": "yn"
   },
   {
    "q": "Has stress affected your academic or professional performance?",
    "k": "yn"
   },
   {
    "q": "Do you feel that your usual coping methods are no longer working?",
    "k": "scale"
   },
   {
    "q": "How long have you been experiencing significant stress?",
    "k": "duration"
   },
   {
    "q": "What is currently your biggest source of stress?",
    "k": "text"
   },
   {
    "q": "How much does stress interfere with your daily functioning?",
    "k": "impact"
   },
   {
    "q": "What kind of support would you most like to receive?",
    "k": "text"
   }
  ],
  "intro": "Too much on your plate and no time to come down from it.",
  "fallback": {
   "causes": [
    {
     "title": "Demands outpacing recovery",
     "detail": "Stress builds when what's asked of you keeps exceeding the time and support you have to recover."
    },
    {
     "title": "Hard-to-hold boundaries",
     "detail": "Taking on more because saying no feels impossible keeps the load growing."
    }
   ],
   "steps": [
    {
     "title": "List and sort your demands",
     "detail": "Write everything down and mark what can wait, be shared or be dropped."
    },
    {
     "title": "Protect a daily recovery slot",
     "detail": "Twenty minutes with no tasks, screens or messages."
    },
    {
     "title": "Practise one clear no",
     "detail": "Decline or delay one new request this week."
    }
   ]
  }
 },
 {
  "slug": "relationships",
  "chip": "Relationships",
  "title": "Relationships",
  "questions": [
   {
    "q": "Are you currently experiencing difficulties in an important relationship?",
    "k": "yn"
   },
   {
    "q": "Do you frequently have misunderstandings with the other person?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to communicate your feelings?",
    "k": "scale"
   },
   {
    "q": "Do you feel that the other person does not understand you?",
    "k": "scale"
   },
   {
    "q": "Do you frequently argue about the same issues?",
    "k": "scale"
   },
   {
    "q": "Do you feel unheard or emotionally unsupported?",
    "k": "scale"
   },
   {
    "q": "Do you have difficulty trusting the other person?",
    "k": "scale"
   },
   {
    "q": "Have unresolved past experiences affected the relationship?",
    "k": "yn"
   },
   {
    "q": "Do you struggle to establish healthy boundaries?",
    "k": "scale"
   },
   {
    "q": "Do you feel that one person is giving significantly more to the relationship?",
    "k": "scale"
   },
   {
    "q": "Do you avoid difficult conversations to prevent conflict?",
    "k": "scale"
   },
   {
    "q": "Do you find yourself becoming defensive during disagreements?",
    "k": "scale"
   },
   {
    "q": "Do you struggle to express your needs directly?",
    "k": "scale"
   },
   {
    "q": "Has jealousy or insecurity created difficulties?",
    "k": "yn"
   },
   {
    "q": "Has a major life change affected your relationship?",
    "k": "yn"
   },
   {
    "q": "Have you considered ending the relationship because of the difficulties?",
    "k": "yn"
   },
   {
    "q": "How long have these relationship concerns been present?",
    "k": "duration"
   },
   {
    "q": "How frequently do conflicts occur?",
    "k": "frequency"
   },
   {
    "q": "What is the biggest issue you would like to address?",
    "k": "text"
   },
   {
    "q": "What would a healthier relationship look like for you?",
    "k": "text"
   }
  ],
  "intro": "Misunderstandings, the same arguments, not feeling heard.",
  "fallback": {
   "causes": [
    {
     "title": "Communication that gets stuck",
     "detail": "When needs aren't said directly, both people end up reacting to guesses, and the same arguments repeat."
    },
    {
     "title": "Unresolved hurt",
     "detail": "Past experiences, inside or outside this relationship, can shape how safe it feels to trust and open up."
    }
   ],
   "steps": [
    {
     "title": "Use 'I feel… when… I need…'",
     "detail": "It says what's going on for you without starting a blame cycle."
    },
    {
     "title": "Pause heated talks",
     "detail": "Agree to take 20 minutes out when things escalate, then come back to it."
    },
    {
     "title": "Name one boundary",
     "detail": "Decide on one thing you need and say it calmly."
    }
   ]
  }
 },
 {
  "slug": "couples",
  "chip": "Couples therapy",
  "title": "Couples",
  "questions": [
   {
    "q": "What is the main reason you and your partner are considering couples therapy?",
    "k": "text"
   },
   {
    "q": "How satisfied are you with your relationship currently?",
    "k": "satisfaction"
   },
   {
    "q": "Do you and your partner communicate openly about difficult topics?",
    "k": "scale",
    "rev": 1
   },
   {
    "q": "Do arguments frequently escalate?",
    "k": "scale"
   },
   {
    "q": "Do you feel emotionally connected to your partner?",
    "k": "scale",
    "rev": 1
   },
   {
    "q": "Do you feel appreciated by your partner?",
    "k": "scale",
    "rev": 1
   },
   {
    "q": "Do you feel able to express your needs safely and honestly?",
    "k": "scale",
    "rev": 1
   },
   {
    "q": "Do you and your partner struggle with trust?",
    "k": "scale"
   },
   {
    "q": "Do you frequently disagree about finances?",
    "k": "scale"
   },
   {
    "q": "Do you disagree about household responsibilities?",
    "k": "scale"
   },
   {
    "q": "Do you disagree about parenting or family decisions?",
    "k": "scale"
   },
   {
    "q": "Has intimacy or affection become a source of conflict?",
    "k": "yn"
   },
   {
    "q": "Has infidelity or another breach of trust affected the relationship?",
    "k": "yn"
   },
   {
    "q": "Do you find yourselves repeatedly discussing the same unresolved problems?",
    "k": "scale"
   },
   {
    "q": "Do either of you withdraw or stop communicating during conflict?",
    "k": "scale"
   },
   {
    "q": "Are you currently considering separation or ending the relationship?",
    "k": "yn"
   },
   {
    "q": "How long have the current relationship difficulties existed?",
    "k": "duration"
   },
   {
    "q": "What has already been tried to improve the relationship?",
    "k": "text"
   },
   {
    "q": "What would you most like to change through couples therapy?",
    "k": "text"
   },
   {
    "q": "Is there anything about the relationship that you believe the therapist should know before the first session?",
    "k": "text"
   }
  ],
  "intro": "For partners who want to understand where things stand together.",
  "fallback": {
   "causes": [
    {
     "title": "A pursue-withdraw pattern",
     "detail": "Often one partner pushes to talk while the other shuts down, and each reaction makes the other's worse."
    },
    {
     "title": "Unmet needs that go unspoken",
     "detail": "Disagreements about money, chores or family are usually about feeling valued, safe or heard underneath."
    }
   ],
   "steps": [
    {
     "title": "Set a weekly check-in",
     "detail": "Twenty minutes to talk about the relationship when you're both calm."
    },
    {
     "title": "Listen to reflect, not to reply",
     "detail": "Repeat back what you heard before giving your side."
    },
    {
     "title": "Notice one thing to appreciate daily",
     "detail": "Say it out loud; small appreciation rebuilds goodwill."
    }
   ]
  }
 },
 {
  "slug": "family",
  "chip": "Family therapy",
  "title": "Family",
  "questions": [
   {
    "q": "What is the main concern affecting your family currently?",
    "k": "text"
   },
   {
    "q": "Are family members having frequent disagreements?",
    "k": "yn"
   },
   {
    "q": "Do you feel misunderstood by members of your family?",
    "k": "scale"
   },
   {
    "q": "Do family members find it difficult to communicate openly?",
    "k": "scale"
   },
   {
    "q": "Are there recurring conflicts that never seem to get resolved?",
    "k": "yn"
   },
   {
    "q": "Do you feel that certain family members are not being heard?",
    "k": "scale"
   },
   {
    "q": "Have recent changes affected your family dynamic?",
    "k": "yn"
   },
   {
    "q": "Has a separation, loss, relocation, illness, or major event affected the family?",
    "k": "yn"
   },
   {
    "q": "Are there disagreements about parenting or caregiving?",
    "k": "yn"
   },
   {
    "q": "Are there conflicts between parents and children?",
    "k": "yn"
   },
   {
    "q": "Are there difficulties involving siblings?",
    "k": "yn"
   },
   {
    "q": "Do family members struggle to respect one another's boundaries?",
    "k": "scale"
   },
   {
    "q": "Do you feel responsible for managing other family members' emotions?",
    "k": "scale"
   },
   {
    "q": "Do you avoid certain topics because they cause conflict?",
    "k": "scale"
   },
   {
    "q": "Does family conflict affect your emotional wellbeing?",
    "k": "scale"
   },
   {
    "q": "Does family conflict affect school, work, or daily functioning?",
    "k": "scale"
   },
   {
    "q": "How long have these family difficulties been occurring?",
    "k": "duration"
   },
   {
    "q": "How often do significant conflicts occur?",
    "k": "frequency"
   },
   {
    "q": "What would you like your family to do differently?",
    "k": "text"
   },
   {
    "q": "What outcome would make family therapy feel helpful to you?",
    "k": "text"
   }
  ],
  "intro": "Conflict, distance or changes that are straining your family.",
  "fallback": {
   "causes": [
    {
     "title": "Roles and expectations that clash",
     "detail": "Families settle into patterns; when life changes, old roles and expectations can stop fitting."
    },
    {
     "title": "Topics no one can safely raise",
     "detail": "When certain subjects are avoided, tension builds and comes out in other arguments."
    }
   ],
   "steps": [
    {
     "title": "Pick a calm time for hard topics",
     "detail": "Not during or right after an argument."
    },
    {
     "title": "Speak for yourself only",
     "detail": "Describe your experience rather than what others always or never do."
    },
    {
     "title": "Agree on one small change",
     "detail": "Start with something every member can commit to."
    }
   ]
  }
 },
 {
  "slug": "trauma-ptsd",
  "chip": "Trauma and PTSD",
  "title": "Trauma & PTSD",
  "questions": [
   {
    "q": "Have you experienced an event that felt extremely frightening, threatening, or overwhelming?",
    "k": "yn"
   },
   {
    "q": "Do memories of a distressing event come back unexpectedly?",
    "k": "scale"
   },
   {
    "q": "Do you experience unwanted or upsetting thoughts about the event?",
    "k": "scale"
   },
   {
    "q": "Do you experience nightmares related to the event?",
    "k": "scale"
   },
   {
    "q": "Do certain places, people, sounds, smells, or situations trigger distressing memories?",
    "k": "scale"
   },
   {
    "q": "Do you avoid people, places, conversations, or activities because they remind you of what happened?",
    "k": "scale"
   },
   {
    "q": "Do you feel emotionally distressed when reminded of the event?",
    "k": "scale"
   },
   {
    "q": "Do you experience strong physical reactions when reminded of it?",
    "k": "scale"
   },
   {
    "q": "Do you feel constantly alert or watchful?",
    "k": "scale"
   },
   {
    "q": "Are you easily startled by unexpected sounds or movements?",
    "k": "yn"
   },
   {
    "q": "Do you have difficulty sleeping because of distressing memories or alertness?",
    "k": "scale"
   },
   {
    "q": "Do you feel emotionally numb or disconnected from others?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to experience positive emotions?",
    "k": "scale"
   },
   {
    "q": "Do you blame yourself or feel guilty about what happened?",
    "k": "scale"
   },
   {
    "q": "Has the experience affected your relationships?",
    "k": "yn"
   },
   {
    "q": "Has it affected your work, education, or everyday life?",
    "k": "yn"
   },
   {
    "q": "How long have you experienced these reactions?",
    "k": "duration"
   },
   {
    "q": "Have your symptoms become more or less intense over time?",
    "k": "trend"
   },
   {
    "q": "What situations currently trigger the strongest reactions?",
    "k": "text"
   },
   {
    "q": "What kind of support would help you feel safer and more in control?",
    "k": "text"
   }
  ],
  "intro": "Something frightening that still shows up in memories, sleep or your body.",
  "fallback": {
   "causes": [
    {
     "title": "A nervous system still on alert",
     "detail": "After something overwhelming, the body can stay prepared for danger long after it has passed."
    },
    {
     "title": "Memories that haven't been processed",
     "detail": "Avoiding reminders is natural, but it can keep the memory raw instead of letting it settle."
    }
   ],
   "steps": [
    {
     "title": "Ground yourself when triggered",
     "detail": "Name 5 things you see, 4 you hear, 3 you can touch."
    },
    {
     "title": "Keep a predictable daily routine",
     "detail": "Routine helps an alert nervous system feel safer."
    },
    {
     "title": "Go at your own pace",
     "detail": "You don't have to retell everything; trauma-focused therapy works step by step."
    }
   ]
  }
 },
 {
  "slug": "grief",
  "chip": "Grief",
  "title": "Grief",
  "questions": [
   {
    "q": "Have you experienced the loss of someone or something important to you?",
    "k": "yn"
   },
   {
    "q": "How recently did the loss occur?",
    "k": "recency"
   },
   {
    "q": "Do you frequently feel sadness related to the loss?",
    "k": "scale"
   },
   {
    "q": "Do you find yourself thinking about the person or situation repeatedly?",
    "k": "scale"
   },
   {
    "q": "Do you miss the person intensely?",
    "k": "scale"
   },
   {
    "q": "Do reminders of the loss trigger strong emotions?",
    "k": "scale"
   },
   {
    "q": "Do you feel anger related to what happened?",
    "k": "scale"
   },
   {
    "q": "Do you experience guilt or regret related to the loss?",
    "k": "scale"
   },
   {
    "q": "Do you feel that there are things you wish you had said or done?",
    "k": "scale"
   },
   {
    "q": "Have you withdrawn from people since the loss?",
    "k": "yn"
   },
   {
    "q": "Have your sleep or eating patterns changed?",
    "k": "yn"
   },
   {
    "q": "Do you find it difficult to enjoy activities you previously enjoyed?",
    "k": "scale"
   },
   {
    "q": "Do you feel emotionally numb at times?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to imagine your life moving forward?",
    "k": "scale"
   },
   {
    "q": "Has grief affected your work or studies?",
    "k": "yn"
   },
   {
    "q": "Has grief affected your relationships?",
    "k": "yn"
   },
   {
    "q": "Do certain dates, places, or memories make your grief significantly stronger?",
    "k": "scale"
   },
   {
    "q": "What part of the grieving process has been hardest for you?",
    "k": "text"
   },
   {
    "q": "What kind of support have you received so far?",
    "k": "text"
   },
   {
    "q": "What would you most like to work through in counselling?",
    "k": "text"
   }
  ],
  "intro": "Losing someone or something important, and how you're carrying it.",
  "fallback": {
   "causes": [
    {
     "title": "Love with nowhere to go",
     "detail": "Grief is the cost of attachment; strong waves of feeling are a normal response to an important loss."
    },
    {
     "title": "Guilt and unfinished conversations",
     "detail": "Wishing you had said or done something differently can keep grief tangled and heavy."
    }
   ],
   "steps": [
    {
     "title": "Give grief some time each day",
     "detail": "Set aside a moment to remember, write or look at photos, rather than holding it in all day."
    },
    {
     "title": "Say what was left unsaid",
     "detail": "Write a letter to the person or about what you lost."
    },
    {
     "title": "Let people help in practical ways",
     "detail": "Accept meals, company or errands when they're offered."
    }
   ]
  }
 },
 {
  "slug": "self-esteem",
  "chip": "Self-esteem",
  "title": "Self-esteem",
  "questions": [
   {
    "q": "How would you describe the way you feel about yourself?",
    "k": "text"
   },
   {
    "q": "Do you frequently doubt your abilities?",
    "k": "scale"
   },
   {
    "q": "Do you often compare yourself negatively with others?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you are not good enough?",
    "k": "scale"
   },
   {
    "q": "Do you have difficulty accepting compliments?",
    "k": "scale"
   },
   {
    "q": "Do you frequently criticize yourself?",
    "k": "scale"
   },
   {
    "q": "Do you focus more on your mistakes than your achievements?",
    "k": "scale"
   },
   {
    "q": "Are you afraid of being judged by others?",
    "k": "yn"
   },
   {
    "q": "Do you avoid opportunities because you doubt yourself?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to express your opinions?",
    "k": "scale"
   },
   {
    "q": "Do you struggle to set boundaries because you fear disappointing others?",
    "k": "scale"
   },
   {
    "q": "Do you seek approval or validation from others?",
    "k": "scale"
   },
   {
    "q": "Do you feel uncomfortable taking credit for your achievements?",
    "k": "scale"
   },
   {
    "q": "Does criticism affect you strongly?",
    "k": "scale"
   },
   {
    "q": "Do you frequently worry about how others perceive you?",
    "k": "scale"
   },
   {
    "q": "Does your self-image affect your relationships?",
    "k": "scale"
   },
   {
    "q": "Does low confidence affect your studies or career?",
    "k": "scale"
   },
   {
    "q": "How long have you struggled with these feelings?",
    "k": "duration"
   },
   {
    "q": "What situations make you feel least confident?",
    "k": "text"
   },
   {
    "q": "What would you like to feel differently about yourself?",
    "k": "text"
   }
  ],
  "intro": "Self-doubt, harsh self-talk and comparing yourself to others.",
  "fallback": {
   "causes": [
    {
     "title": "A harsh inner critic",
     "detail": "Self-talk learned early on, often from criticism or comparison, can become automatic and feel like the truth."
    },
    {
     "title": "Approval as the measure of worth",
     "detail": "When your sense of value depends on others' opinions, criticism hits hard and praise doesn't stick."
    }
   ],
   "steps": [
    {
     "title": "Catch and rephrase self-criticism",
     "detail": "Ask how you'd speak to a friend in the same situation."
    },
    {
     "title": "Write down three things you did well each day",
     "detail": "Small wins count; they retrain where your attention goes."
    },
    {
     "title": "Do one thing you've been avoiding out of self-doubt",
     "detail": "Start small and notice what actually happens."
    }
   ]
  }
 },
 {
  "slug": "sleep",
  "chip": "Sleep problems",
  "title": "Sleep",
  "questions": [
   {
    "q": "Do you regularly have difficulty falling asleep?",
    "k": "scale"
   },
   {
    "q": "Do you wake up repeatedly during the night?",
    "k": "scale"
   },
   {
    "q": "Do you wake earlier than intended and struggle to fall asleep again?",
    "k": "scale"
   },
   {
    "q": "Do you feel tired even after spending enough time in bed?",
    "k": "scale"
   },
   {
    "q": "Do you frequently worry about not getting enough sleep?",
    "k": "scale"
   },
   {
    "q": "Does your mind remain active when you try to sleep?",
    "k": "scale"
   },
   {
    "q": "Do you experience racing thoughts at bedtime?",
    "k": "scale"
   },
   {
    "q": "Do stress or anxiety make it difficult for you to sleep?",
    "k": "scale"
   },
   {
    "q": "Do you regularly use your phone or other screens close to bedtime?",
    "k": "scale"
   },
   {
    "q": "Do you have an inconsistent sleep schedule?",
    "k": "scale"
   },
   {
    "q": "Do you regularly sleep during the day?",
    "k": "scale"
   },
   {
    "q": "Do you find yourself relying on particular habits or substances to fall asleep?",
    "k": "scale"
   },
   {
    "q": "Do sleep difficulties affect your mood?",
    "k": "scale"
   },
   {
    "q": "Do sleep difficulties affect your concentration?",
    "k": "scale"
   },
   {
    "q": "Do sleep difficulties affect your work or studies?",
    "k": "scale"
   },
   {
    "q": "Do you feel irritable because of poor sleep?",
    "k": "scale"
   },
   {
    "q": "How long have your sleep difficulties been occurring?",
    "k": "duration"
   },
   {
    "q": "How many nights per week do you typically experience them?",
    "k": "nights"
   },
   {
    "q": "What is the biggest problem you experience with sleep?",
    "k": "text"
   },
   {
    "q": "How would improving your sleep change your daily life?",
    "k": "text"
   }
  ],
  "intro": "Trouble falling asleep, staying asleep or waking up rested.",
  "fallback": {
   "causes": [
    {
     "title": "A busy mind at bedtime",
     "detail": "Stress and worry keep the brain alert just when it needs to wind down."
    },
    {
     "title": "Habits that confuse your body clock",
     "detail": "Screens late at night, irregular sleep times and daytime naps can make it harder to fall and stay asleep."
    }
   ],
   "steps": [
    {
     "title": "Fix your wake-up time",
     "detail": "Same time every day, even weekends; it anchors your body clock."
    },
    {
     "title": "Screens off 45 minutes before bed",
     "detail": "Swap them for reading, a shower or slow breathing."
    },
    {
     "title": "Get up if you can't sleep",
     "detail": "After 20 minutes awake, do something calm in dim light, then return to bed."
    }
   ]
  }
 },
 {
  "slug": "burnout",
  "chip": "Work burnout",
  "title": "Work burnout",
  "questions": [
   {
    "q": "Do you feel emotionally exhausted by your work?",
    "k": "scale"
   },
   {
    "q": "Do you frequently feel drained before starting your workday?",
    "k": "scale"
   },
   {
    "q": "Do you feel that work demands are overwhelming?",
    "k": "scale"
   },
   {
    "q": "Do you struggle to mentally disconnect from work after hours?",
    "k": "scale"
   },
   {
    "q": "Do you feel less motivated about your work than before?",
    "k": "scale"
   },
   {
    "q": "Have you become more negative or cynical about your workplace?",
    "k": "yn"
   },
   {
    "q": "Do you feel that your work is no longer meaningful?",
    "k": "scale"
   },
   {
    "q": "Do you find it increasingly difficult to concentrate at work?",
    "k": "scale"
   },
   {
    "q": "Has your productivity decreased?",
    "k": "yn"
   },
   {
    "q": "Do you feel that you are constantly working without enough recovery time?",
    "k": "scale"
   },
   {
    "q": "Do you have difficulty taking breaks or using your leave?",
    "k": "scale"
   },
   {
    "q": "Do you feel guilty when you are not working?",
    "k": "scale"
   },
   {
    "q": "Has work affected your sleep?",
    "k": "yn"
   },
   {
    "q": "Has work affected your physical or emotional wellbeing?",
    "k": "yn"
   },
   {
    "q": "Has work affected your relationships outside the workplace?",
    "k": "yn"
   },
   {
    "q": "Do you feel unable to maintain a healthy work-life balance?",
    "k": "scale"
   },
   {
    "q": "How long have you felt this level of exhaustion?",
    "k": "duration"
   },
   {
    "q": "What aspect of work is contributing most to your burnout?",
    "k": "text"
   },
   {
    "q": "What have you tried so far to manage it?",
    "k": "text"
   },
   {
    "q": "What would a healthier relationship with work look like for you?",
    "k": "text"
   }
  ],
  "intro": "Exhaustion and detachment that comes from work that never stops.",
  "fallback": {
   "causes": [
    {
     "title": "Effort without enough recovery",
     "detail": "Burnout builds when demands stay high for a long time without real rest, control or recognition."
    },
    {
     "title": "Work that has become your identity",
     "detail": "Feeling guilty when you're not working makes it hard to switch off and refill."
    }
   ],
   "steps": [
    {
     "title": "Take real breaks during the day",
     "detail": "Short, screen-free breaks every 90 minutes help more than one long break."
    },
    {
     "title": "Set a clear end to the workday",
     "detail": "A fixed shutdown time and a short ritual to mark it."
    },
    {
     "title": "Talk to your manager about one change",
     "detail": "Workload, deadlines or flexibility; name one thing that would help most."
    }
   ]
  }
 },
 {
  "slug": "exam-stress",
  "chip": "Exam stress",
  "title": "Exam stress",
  "questions": [
   {
    "q": "Do you feel overwhelmed by upcoming exams or academic deadlines?",
    "k": "scale"
   },
   {
    "q": "Do you frequently worry about your exam performance?",
    "k": "scale"
   },
   {
    "q": "Do you fear disappointing your parents, teachers, or yourself?",
    "k": "scale"
   },
   {
    "q": "Do you struggle to concentrate while studying?",
    "k": "scale"
   },
   {
    "q": "Do you procrastinate because studying feels overwhelming?",
    "k": "scale"
   },
   {
    "q": "Do you find yourself avoiding study-related tasks?",
    "k": "scale"
   },
   {
    "q": "Do you experience racing thoughts before or during exams?",
    "k": "scale"
   },
   {
    "q": "Do you experience physical symptoms such as sweating, trembling, nausea, or rapid heartbeat around exams?",
    "k": "scale"
   },
   {
    "q": "Do you have difficulty sleeping because you are thinking about exams?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you have to achieve very high marks to feel successful?",
    "k": "scale"
   },
   {
    "q": "Do you compare your academic performance with others?",
    "k": "scale"
   },
   {
    "q": "Do you feel excessive pressure from family or teachers?",
    "k": "scale"
   },
   {
    "q": "Do you experience a mental blank during exams?",
    "k": "scale"
   },
   {
    "q": "Does fear of failure affect your preparation?",
    "k": "scale"
   },
   {
    "q": "Has exam stress affected your appetite or daily routine?",
    "k": "yn"
   },
   {
    "q": "Has exam pressure affected your relationships or mood?",
    "k": "yn"
   },
   {
    "q": "How long have you been experiencing significant exam-related stress?",
    "k": "duration"
   },
   {
    "q": "What upcoming exam or academic situation is causing the most concern?",
    "k": "text"
   },
   {
    "q": "What usually happens when you feel overwhelmed while studying?",
    "k": "text"
   },
   {
    "q": "What kind of support would help you feel more prepared and calm?",
    "k": "text"
   }
  ],
  "intro": "Pressure, fear of failure and blanking out around exams.",
  "fallback": {
   "causes": [
    {
     "title": "Pressure tied to self-worth",
     "detail": "When marks feel like a verdict on you or your family's hopes, fear can crowd out focus."
    },
    {
     "title": "Overwhelm leading to avoidance",
     "detail": "Procrastinating is often a way of escaping that feeling, which then adds to the pressure."
    }
   ],
   "steps": [
    {
     "title": "Break study into 25-minute blocks",
     "detail": "Short sessions with 5-minute breaks make starting easier."
    },
    {
     "title": "Practise under exam conditions",
     "detail": "Timed practice papers reduce the shock of the real thing."
    },
    {
     "title": "Protect sleep before exams",
     "detail": "Sleep consolidates what you've learnt; all-nighters undo it."
    }
   ]
  }
 },
 {
  "slug": "anger",
  "chip": "Anger management",
  "title": "Anger",
  "questions": [
   {
    "q": "Do you become angry more quickly than you would like?",
    "k": "scale"
   },
   {
    "q": "Do relatively small situations sometimes trigger strong anger?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to calm down once you are angry?",
    "k": "scale"
   },
   {
    "q": "Do you raise your voice during arguments?",
    "k": "scale"
   },
   {
    "q": "Do you say things when angry that you later regret?",
    "k": "scale"
   },
   {
    "q": "Do you have difficulty communicating your feelings before they build up?",
    "k": "scale"
   },
   {
    "q": "Do you frequently feel frustrated by other people's behaviour?",
    "k": "scale"
   },
   {
    "q": "Do you become angry when you feel ignored or disrespected?",
    "k": "scale"
   },
   {
    "q": "Do you experience physical signs of anger such as tension, rapid heartbeat, or clenched fists?",
    "k": "scale"
   },
   {
    "q": "Do you tend to suppress anger until it eventually comes out strongly?",
    "k": "scale"
   },
   {
    "q": "Do you withdraw from people when angry?",
    "k": "scale"
   },
   {
    "q": "Has anger caused problems in your relationships?",
    "k": "yn"
   },
   {
    "q": "Has anger caused problems at work or school?",
    "k": "yn"
   },
   {
    "q": "Have you damaged property or acted aggressively when angry?",
    "k": "yn",
    "flag": "harm"
   },
   {
    "q": "Have you ever felt worried about losing control of your behaviour?",
    "k": "yn",
    "flag": "harm"
   },
   {
    "q": "Do you frequently feel guilty after becoming angry?",
    "k": "scale"
   },
   {
    "q": "How long have you been experiencing difficulties with anger?",
    "k": "duration"
   },
   {
    "q": "What situations most commonly trigger your anger?",
    "k": "text"
   },
   {
    "q": "What usually helps you calm down?",
    "k": "text"
   },
   {
    "q": "What would you like to learn or change about how you handle anger?",
    "k": "text"
   }
  ],
  "intro": "Anger that comes fast, stays long or costs you later.",
  "fallback": {
   "causes": [
    {
     "title": "Feelings that build up unsaid",
     "detail": "Holding back hurt or frustration until it bursts out is one of the most common patterns behind strong anger."
    },
    {
     "title": "A fast threat response",
     "detail": "Feeling ignored or disrespected can trigger a quick fight response before the thinking brain catches up."
    }
   ],
   "steps": [
    {
     "title": "Notice early warning signs",
     "detail": "Clenched jaw, heat, a faster heartbeat. That's the moment to pause."
    },
    {
     "title": "Take a 20-minute time-out",
     "detail": "Step away, breathe slowly and come back when your body has settled."
    },
    {
     "title": "Say what you need before it builds",
     "detail": "Raise small frustrations early and calmly."
    }
   ]
  }
 },
 {
  "slug": "ocd",
  "chip": "OCD",
  "title": "OCD",
  "questions": [
   {
    "q": "Do you experience unwanted, intrusive, or distressing thoughts that repeatedly enter your mind?",
    "k": "scale"
   },
   {
    "q": "Do these thoughts feel difficult to control?",
    "k": "scale"
   },
   {
    "q": "Do you worry excessively about contamination, harm, mistakes, or safety?",
    "k": "scale"
   },
   {
    "q": "Do you feel a strong need for things to be arranged or done in a particular way?",
    "k": "scale"
   },
   {
    "q": "Do you repeatedly check things such as locks, switches, appliances, messages, or documents?",
    "k": "scale"
   },
   {
    "q": "Do you repeatedly wash or clean because of fear or discomfort?",
    "k": "scale"
   },
   {
    "q": "Do you repeatedly seek reassurance from others?",
    "k": "scale"
   },
   {
    "q": "Do you repeatedly count, repeat, or perform specific actions mentally or physically?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you must perform certain behaviours to reduce anxiety?",
    "k": "scale"
   },
   {
    "q": "Do you recognize that some of these thoughts or behaviours may be excessive or unreasonable?",
    "k": "scale",
    "noscore": 1
   },
   {
    "q": "How much time do these thoughts or behaviours take each day?",
    "k": "time"
   },
   {
    "q": "Do these thoughts or behaviours interfere with your work or studies?",
    "k": "scale"
   },
   {
    "q": "Do they interfere with your relationships?",
    "k": "scale"
   },
   {
    "q": "Do you avoid certain places, objects, people, or activities because of these concerns?",
    "k": "scale"
   },
   {
    "q": "Do you feel significant distress when you try not to perform a particular behaviour?",
    "k": "scale"
   },
   {
    "q": "Have these concerns changed or increased over time?",
    "k": "yn"
   },
   {
    "q": "How long have you experienced these thoughts or behaviours?",
    "k": "duration"
   },
   {
    "q": "What type of thoughts or behaviours causes you the most distress?",
    "k": "text"
   },
   {
    "q": "What do you currently do to manage them?",
    "k": "text"
   },
   {
    "q": "How much do these concerns interfere with your everyday life?",
    "k": "impact"
   }
  ],
  "intro": "Intrusive thoughts and the urge to check, clean, count or repeat.",
  "fallback": {
   "causes": [
    {
     "title": "The doubt-and-relief loop",
     "detail": "Intrusive thoughts bring anxiety; checking or repeating brings brief relief, which teaches the brain to demand it again."
    },
    {
     "title": "Thoughts treated as dangerous",
     "detail": "Everyone has odd or upsetting thoughts; trying hard to push them away usually makes them stickier."
    }
   ],
   "steps": [
    {
     "title": "Delay the ritual a little",
     "detail": "When you feel the urge, wait five minutes before acting on it, and stretch that over time."
    },
    {
     "title": "Label the thought",
     "detail": "Say 'that's an OCD thought' rather than arguing with it."
    },
    {
     "title": "Reduce reassurance-seeking",
     "detail": "Ask for reassurance once instead of many times."
    }
   ]
  }
 },
 {
  "slug": "panic-attacks",
  "chip": "Panic attacks",
  "title": "Panic attacks",
  "questions": [
   {
    "q": "Have you experienced sudden episodes of intense fear or discomfort?",
    "k": "yn"
   },
   {
    "q": "Do these episodes sometimes occur unexpectedly?",
    "k": "scale"
   },
   {
    "q": "During these episodes, does your heart race or pound?",
    "k": "scale"
   },
   {
    "q": "Do you experience difficulty breathing or a feeling of being unable to get enough air?",
    "k": "scale",
    "flag": "medical"
   },
   {
    "q": "Do you experience trembling or shaking?",
    "k": "scale"
   },
   {
    "q": "Do you experience sweating or chills?",
    "k": "scale"
   },
   {
    "q": "Do you experience dizziness, light-headedness, or weakness?",
    "k": "scale",
    "flag": "medical"
   },
   {
    "q": "Do you experience chest discomfort during these episodes?",
    "k": "scale",
    "flag": "medical"
   },
   {
    "q": "Do you experience nausea or stomach discomfort?",
    "k": "scale"
   },
   {
    "q": "Do you feel detached from yourself or your surroundings during an episode?",
    "k": "scale"
   },
   {
    "q": "Do you fear losing control during these episodes?",
    "k": "scale"
   },
   {
    "q": "Do you fear that something serious is happening to you when an episode occurs?",
    "k": "scale"
   },
   {
    "q": "Do you worry about experiencing another episode?",
    "k": "scale"
   },
   {
    "q": "Have you changed your behaviour to avoid situations where you fear an episode might occur?",
    "k": "yn"
   },
   {
    "q": "Do these episodes affect your ability to travel, work, study, or socialize?",
    "k": "scale"
   },
   {
    "q": "Have you stopped doing activities because of fear of another episode?",
    "k": "yn"
   },
   {
    "q": "How frequently do these episodes occur?",
    "k": "frequency"
   },
   {
    "q": "When did you first experience them?",
    "k": "since"
   },
   {
    "q": "What usually happens immediately before an episode?",
    "k": "text"
   },
   {
    "q": "What support would help you feel safer when experiencing these symptoms?",
    "k": "text"
   }
  ],
  "intro": "Sudden waves of intense fear with a racing heart or breathlessness.",
  "fallback": {
   "causes": [
    {
     "title": "A false alarm in the body",
     "detail": "Panic is the body's emergency response firing when there's no actual danger, which makes the sensations feel alarming."
    },
    {
     "title": "Fear of the fear",
     "detail": "Worrying about the next episode and avoiding places keeps the alarm system sensitive."
    }
   ],
   "steps": [
    {
     "title": "Ride the wave",
     "detail": "Panic peaks and passes, usually within 10 minutes. Remind yourself it will pass."
    },
    {
     "title": "Breathe slowly, out longer than in",
     "detail": "In for 4, out for 6 to calm the body's alarm."
    },
    {
     "title": "Get a medical check-up",
     "detail": "Rule out physical causes, especially for chest pain or breathlessness, so you can trust what your body is telling you."
    }
   ]
  }
 },
 {
  "slug": "loneliness",
  "chip": "Loneliness",
  "title": "Loneliness",
  "questions": [
   {
    "q": "Do you frequently feel lonely even when other people are around?",
    "k": "scale"
   },
   {
    "q": "Do you feel that you lack meaningful emotional connections?",
    "k": "scale"
   },
   {
    "q": "Do you feel that nobody truly understands you?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to form new friendships?",
    "k": "scale"
   },
   {
    "q": "Do you find it difficult to maintain close relationships?",
    "k": "scale"
   },
   {
    "q": "Do you frequently feel left out or disconnected?",
    "k": "scale"
   },
   {
    "q": "Do you avoid social situations because you feel uncomfortable or anxious?",
    "k": "scale"
   },
   {
    "q": "Do you want more meaningful relationships in your life?",
    "k": "scale"
   },
   {
    "q": "Do you hesitate to reach out to people when you need support?",
    "k": "scale"
   },
   {
    "q": "Do you worry that others may reject or judge you?",
    "k": "scale"
   },
   {
    "q": "Do you feel emotionally disconnected from friends or family?",
    "k": "scale"
   },
   {
    "q": "Has loneliness increased after a major life change?",
    "k": "yn"
   },
   {
    "q": "Do you spend more time alone than you would like?",
    "k": "scale"
   },
   {
    "q": "Does loneliness affect your mood?",
    "k": "scale"
   },
   {
    "q": "Does loneliness affect your sleep or daily routine?",
    "k": "scale"
   },
   {
    "q": "Do you feel that your current relationships meet your emotional needs?",
    "k": "scale",
    "rev": 1
   },
   {
    "q": "How long have you been experiencing significant loneliness?",
    "k": "duration"
   },
   {
    "q": "When do you feel most lonely?",
    "k": "text"
   },
   {
    "q": "What do you wish were different about your social or emotional life?",
    "k": "text"
   },
   {
    "q": "What kind of connection or support are you hoping to build?",
    "k": "text"
   }
  ],
  "intro": "Feeling alone or unseen, even when people are around.",
  "fallback": {
   "causes": [
    {
     "title": "Connection that doesn't meet your needs",
     "detail": "You can be around people and still feel unseen if the connections don't feel close or understanding."
    },
    {
     "title": "Fear of rejection holding you back",
     "detail": "Worry about being judged can make reaching out feel risky, so the distance grows."
    }
   ],
   "steps": [
    {
     "title": "Reach out to one person this week",
     "detail": "A message or call to someone you've lost touch with."
    },
    {
     "title": "Join something regular",
     "detail": "A class, group or volunteering gives repeated contact, which is how closeness grows."
    },
    {
     "title": "Be kind to yourself about it",
     "detail": "Loneliness is a signal of a need, not a flaw in you."
    }
   ]
  }
 }
] as Concern[];

export const QUIZ_BY_SLUG: Record<string, Concern> = Object.fromEntries(CONCERN_QUIZZES.map((c) => [c.slug, c]));
export const QUIZ_BY_CHIP: Record<string, Concern> = Object.fromEntries(CONCERN_QUIZZES.map((c) => [c.chip, c]));

export const CRISIS_LINES = [
  { name: "Tele MANAS", number: "14416", tel: "14416", note: "Free, 24/7, in 20+ languages" },
  { name: "KIRAN", number: "1800-599-0019", tel: "18005990019", note: "Free, 24/7 mental health helpline" },
  { name: "Emergency", number: "112", tel: "112", note: "Police, ambulance, fire" },
];

/** True if this answer to the self-harm question means we stop and show crisis support. */
export function isSafetyTrigger(q: Question, a: Answer | undefined) {
  return q.k === "safety" && typeof a === "number" && a > 0;
}

// Plain-language crisis phrases (English, Hinglish). Errs toward showing help.
const CRISIS_RE =
  /\b(suicid\w*|kill (?:my ?self|me)|end (?:it all|my life)|ending my life|want to die|wanna die|better off dead|self[- ]?harm\w*|hurt(?:ing)? myself|cut(?:ting)? myself|no reason to live|marna chahta|marna chahti|mar jaun|jeena nahi|khudkushi|aatmahatya)\b/i;

export function textSuggestsCrisis(text: string) {
  return CRISIS_RE.test(text);
}

export function needsSafetyScreen(c: Concern, answers: Answer[]) {
  return c.questions.some((q, i) => isSafetyTrigger(q, answers[i])) || answers.some((a) => typeof a === "string" && textSuggestsCrisis(a));
}

export function optionValue(q: Question, a: Answer | undefined): number | null {
  if (q.k === "text" || typeof a !== "number" || q.noscore) return null;
  const v = OPTIONS[q.k][a]?.v;
  if (v == null) return null;
  return q.rev ? 1 - v : v;
}

export type Band = { key: "light" | "moderate" | "heavy"; label: string; line: string };

export function score(c: Concern, answers: Answer[]) {
  const vals = c.questions.map((q, i) => optionValue(q, answers[i])).filter((v): v is number => v != null);
  const s = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const band: Band =
    s < 0.34
      ? { key: "light", label: "Light", line: "seems to be affecting you a little" }
      : s < 0.62
        ? { key: "moderate", label: "Moderate", line: "seems to be affecting you quite a bit" }
        : { key: "heavy", label: "Heavy", line: "seems to be weighing on you a lot" };
  return { score: s, band };
}

/** The answers that pointed most strongly to difficulty, for the summary. */
export function topSignals(c: Concern, answers: Answer[], n = 4) {
  return c.questions
    .map((q, i) => ({ q, i, v: optionValue(q, answers[i]) }))
    .filter((x) => x.v != null && x.v >= 2 / 3 && (x.q.k === "scale" || x.q.k === "yn"))
    .sort((a, b) => (b.v as number) - (a.v as number))
    .slice(0, n)
    .map((x) => ({ question: x.q.q, answer: answerLabel(x.q, answers[x.i]) }));
}

export function answerLabel(q: Question, a: Answer | undefined) {
  if (q.k === "text") return typeof a === "string" && a.trim() ? a.trim() : "(skipped)";
  return typeof a === "number" ? OPTIONS[q.k][a]?.l ?? "" : "";
}

/** Medical / harm notes that must show regardless of what the AI writes. */
export function flags(c: Concern, answers: Answer[]) {
  const hit = (f: "medical" | "harm") =>
    c.questions.some((q, i) => q.flag === f && (optionValue(q, answers[i]) ?? 0) >= 0.5);
  return { medical: c.slug === "panic-attacks" && hit("medical"), harm: hit("harm") };
}

export function isComplete(c: Concern, answers: Answer[]) {
  return c.questions.every((q, i) => (q.k === "text" ? typeof answers[i] === "string" : typeof answers[i] === "number"));
}
