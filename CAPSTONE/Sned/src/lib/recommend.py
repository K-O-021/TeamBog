"""
recommend.py
------------
Builds dynamic, personalized recommendation text from the model's
predicted category + the actual session input fields.

Each recommendation is unique per student — it injects the student's
name, subject, specific indicators observed, participation level,
and mood into the output instead of returning a fixed string.
"""

import random

# ── Tone helpers ───────────────────────────────────────────────────────────────

def _name(inputs):
    return inputs.get("student_name", "The student")

def _subject(inputs):
    s = inputs.get("subject", "")
    return f" in {s}" if s else ""

def _part_label(level):
    return {1: "very low", 2: "low", 3: "moderate", 4: "high", 5: "very high"}.get(int(level), "moderate")

def _list(items, limit=3):
    items = list(items)[:limit]
    if not items:
        return None
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]

def _intervention_note(inputs):
    applied = list(inputs.get("interventions_applied", []))
    if not applied:
        return ""
    chosen = applied[0]
    notes = {
        "Verbal Reminder":       "A verbal reminder was applied and may be continued as needed.",
        "Seat Adjustment":       "A seat adjustment was implemented to support focus.",
        "Task Modification":     "Task modification was applied — continue adjusting as needed.",
        "Counseling / Check-in": "A counseling check-in was conducted; maintain this practice.",
        "Referral to Guidance":  "A referral to guidance has been initiated — follow up on progress.",
        "Positive Reinforcement":"Positive reinforcement was used effectively; keep applying it.",
        "Other":                 "An intervention was applied; document and monitor its effectiveness.",
    }
    return notes.get(chosen, "")


# ── Per-category dynamic builders ─────────────────────────────────────────────

def _excellent_performance(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    pos     = list(inputs.get("positive_indicators", []))
    part    = _part_label(inputs.get("participation_level", 5))

    pos_str = _list(pos) or "strong engagement and effort"

    sentences = [
        f"{name} had an excellent session{subject}, demonstrating {pos_str} "
        f"with {part} participation."
    ]

    if "Social Engagement" in pos or "Functional Communication" in pos:
        sentences.append(
            f"Consider assigning {name} peer-mentoring or leadership roles "
            f"to channel social strengths constructively."
        )
    if "Learning Progress" in pos or "Sustained Attention" in pos:
        sentences.append(
            f"Enrichment or advanced tasks are recommended to keep {name} "
            f"motivated and challenged."
        )
    if "Organized Work Habits" in pos or "Task Completion" in pos:
        sentences.append(
            f"Recognize {name}'s consistency and work ethic to reinforce these habits."
        )

    sentences.append(
        "Continue current strategies and maintain positive momentum."
    )
    return " ".join(sentences)


def _enthusiasm_management(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))
    part    = _part_label(inputs.get("participation_level", 3))

    sentences = [
        f"{name} showed high enthusiasm{subject} with {part} participation, "
        f"but needed guidance on channeling energy appropriately."
    ]

    if "Hyperactivity" in neg:
        sentences.append(
            f"Incorporating structured movement breaks for {name} between "
            f"activities may help reduce hyperactivity in the classroom."
        )
    if "Inattention" in neg:
        sentences.append(
            f"Introduce a hand-raising or turn-taking protocol to help {name} "
            f"stay focused without disrupting peers."
        )
    else:
        sentences.append(
            f"Reinforce structured participation routines such as turn-taking "
            f"or designated response cues for {name}."
        )

    inote = _intervention_note(inputs)
    if inote:
        sentences.append(inote)

    return " ".join(sentences)


def _anxiety_support(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))
    part    = int(inputs.get("participation_level", 2))

    sentences = [
        f"{name} showed signs of anxiety during today's {subject.strip() or 'session'}, "
        f"which appears to be affecting classroom participation."
    ]

    if "Sensory Overload" in neg:
        sentences.append(
            f"Evaluate the classroom environment for sensory triggers that may "
            f"be affecting {name} and make adjustments such as reducing noise or visual clutter."
        )
    if "Communication Difficulty" in neg:
        sentences.append(
            f"Offer {name} alternative ways to demonstrate understanding, "
            f"such as written responses or private check-ins, to reduce verbal pressure."
        )
    if part <= 2:
        sentences.append(
            f"Gradually increase participation expectations for {name} using scaffolded "
            f"support and reassurance before each activity."
        )
    else:
        sentences.append(
            f"Provide low-pressure check-ins before tasks and continue monitoring "
            f"{name}'s comfort level throughout the session."
        )

    sentences.append(
        f"Consult with the guidance team if anxiety patterns persist across sessions."
    )
    return " ".join(sentences)


def _behavioral_anxious(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))

    sentences = [
        f"{name}'s anxiety significantly impacted participation{subject} today, "
        f"resulting in a behavioral incident that required intervention."
    ]
    sentences.append(
        f"Consult with the special education or guidance team to develop an "
        f"anxiety management plan for {name}."
    )
    if "Sensory Overload" in neg:
        sentences.append(
            f"Assess whether sensory factors contributed to {name}'s distress "
            f"and implement accommodations as needed."
        )
    sentences.append(
        f"Reduce performance pressure by offering alternative assessment formats "
        f"and conducting regular check-ins before and after each session."
    )
    return " ".join(sentences)


def _frustration_high(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    pos     = list(inputs.get("positive_indicators", []))
    neg     = list(inputs.get("negative_indicators", []))
    part    = _part_label(inputs.get("participation_level", 3))

    pos_str = _list(pos)
    sentences = [
        f"{name} demonstrated {part} participation{subject} and made an effort "
        f"despite visible frustration."
    ]

    if pos_str:
        sentences.append(
            f"Observed strengths include {pos_str} — acknowledge these to build confidence."
        )

    sentences.append(
        f"Help {name} identify the specific areas causing difficulty "
        f"so targeted support can be provided."
    )

    if "Inattention" in neg:
        sentences.append(
            f"Break tasks into shorter segments with clear checkpoints to help "
            f"{name} maintain focus."
        )
    if "Emotional Outbursts" in neg:
        sentences.append(
            f"Introduce calm-down strategies such as deep breathing or a brief "
            f"designated break area for {name} to use when frustration escalates."
        )

    inote = _intervention_note(inputs)
    if inote:
        sentences.append(inote)

    return " ".join(sentences)


def _frustration_low(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))

    sentences = [
        f"{name}'s frustration{subject} is significantly limiting engagement "
        f"and requires immediate instructional adjustment."
    ]
    sentences.append(
        f"Consider modifying task complexity for {name} and using visual aids "
        f"or worked examples to reduce barriers to participation."
    )

    if "Inattention" in neg or "Hyperactivity" in neg:
        sentences.append(
            f"Short, structured tasks with frequent check-ins are recommended "
            f"to re-engage {name} and prevent further disengagement."
        )
    if "Emotional Outbursts" in neg or "Aggression" in neg:
        sentences.append(
            f"Teach and reinforce calm-down strategies for {name}, such as "
            f"a feelings chart, deep breathing, or a designated cool-down space."
        )

    sentences.append(
        f"Coordinate with the guidance counselor if frustration patterns "
        f"persist across multiple sessions."
    )
    return " ".join(sentences)


def _behavioral_frustrated(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)

    sentences = [
        f"{name} experienced a behavioral incident{subject} driven by frustration, "
        f"indicating difficulty managing emotions in a classroom setting."
    ]
    sentences.append(
        f"Break upcoming lessons into smaller, achievable segments to reduce "
        f"the overwhelm that contributes to {name}'s frustration."
    )
    sentences.append(
        f"Develop a behavior support plan with clear expectations and consistent "
        f"consequences in coordination with the guidance counselor."
    )
    sentences.append(
        f"Schedule a one-on-one check-in with {name} to identify specific "
        f"triggers and co-create coping strategies."
    )
    return " ".join(sentences)


def _fatigue_support(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))
    part    = int(inputs.get("participation_level", 2))

    sentences = [
        f"{name}'s fatigue{subject} is visibly impacting learning and participation."
    ]
    sentences.append(
        f"Communicate with {name}'s parents or guardians regarding sleep habits "
        f"and home routines that may be contributing to persistent tiredness."
    )

    if part <= 2:
        sentences.append(
            f"Temporarily reduce task volume for {name} to prevent further "
            f"disengagement due to energy depletion."
        )
    if "Inattention" in neg:
        sentences.append(
            f"Use active learning strategies and brief, frequent check-ins "
            f"to re-engage {name} throughout the session."
        )
    if "Sensory Overload" in neg:
        sentences.append(
            f"Minimize environmental stimulation and provide a calm workspace "
            f"to help {name} concentrate despite fatigue."
        )

    return " ".join(sentences)


def _behavioral_fatigued(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)

    sentences = [
        f"Persistent fatigue led to a behavioral incident for {name}{subject} today, "
        f"severely impacting the ability to function in class."
    ]
    sentences.append(
        f"Urgently communicate with {name}'s parents about sleep, diet, and "
        f"home environment factors that may be contributing to extreme fatigue."
    )
    sentences.append(
        f"Explore whether a temporary modified schedule or reduced workload "
        f"can be arranged to support {name}'s recovery and re-engagement."
    )
    return " ".join(sentences)


def _emotional_support_sad(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))
    part    = int(inputs.get("participation_level", 2))

    sentences = [
        f"{name} appeared emotionally distressed during today's session{subject}."
    ]
    sentences.append(
        f"A warm, supportive check-in at the start of each session is recommended "
        f"to help {name} feel safe and ready to learn."
    )

    if "Social Difficulty" in neg:
        sentences.append(
            f"Avoid placing {name} in high-pressure group situations until "
            f"emotional state improves."
        )
    if "Communication Difficulty" in neg:
        sentences.append(
            f"Encourage {name} to express feelings through journaling or "
            f"one-on-one conversations rather than group settings."
        )
    if part <= 2:
        sentences.append(
            f"Refer {name} to the guidance counselor and notify parents if "
            f"withdrawn behavior continues beyond this session."
        )
    else:
        sentences.append(
            f"Monitor {name} closely over the next few sessions and maintain "
            f"open, non-pressuring communication."
        )

    return " ".join(sentences)


def _behavioral_sad(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)

    sentences = [
        f"{name} is experiencing significant emotional distress that resulted "
        f"in a behavioral incident{subject} today."
    ]
    sentences.append(
        f"Immediate referral to the guidance counselor is recommended for {name}."
    )
    sentences.append(
        f"Notify parents and coordinate a comprehensive support plan that "
        f"addresses both {name}'s academic and emotional needs."
    )
    sentences.append(
        f"Reduce academic pressure in the short term and prioritize "
        f"{name}'s emotional safety and stability."
    )
    return " ".join(sentences)


def _physical_aggression(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    neg     = list(inputs.get("negative_indicators", []))

    sentences = [
        f"A physical aggression incident involving {name} occurred{subject} today "
        f"and required immediate de-escalation."
    ]
    sentences.append(
        f"A structured behavior intervention plan must be developed for {name} "
        f"with the guidance counselor as a priority."
    )
    if "Aggression" in neg or "Emotional Outbursts" in neg:
        sentences.append(
            f"Anger management strategies and consistent emotional regulation "
            f"routines are strongly recommended for {name}."
        )
    sentences.append(
        f"Inform {name}'s parents of the incident, document all details, "
        f"and follow the school's escalation protocol."
    )
    return " ".join(sentences)


def _urgent_self_harm(inputs):
    name = _name(inputs)
    return (
        f"Urgent attention is required for {name}. Observed behavior may indicate "
        f"self-harm. Immediately refer to the guidance counselor and notify the "
        f"parent or guardian. Do not leave {name} unattended. "
        f"Document and escalate per school protocol without delay."
    )


def _general_mixed(inputs):
    name    = _name(inputs)
    subject = _subject(inputs)
    pos     = list(inputs.get("positive_indicators", []))
    neg     = list(inputs.get("negative_indicators", []))

    pos_str = _list(pos)
    neg_str = _list(neg)

    sentences = [
        f"{name} showed a mixed behavioral profile{subject} during today's session."
    ]
    if pos_str:
        sentences.append(
            f"Observed strengths include {pos_str} — continue reinforcing these."
        )
    if neg_str:
        sentences.append(
            f"Areas that need attention include {neg_str}."
        )
    sentences.append(
        f"Maintain consistent routines for {name}, reinforce positive behaviors, "
        f"and address concerns with targeted, individualized support."
    )
    sentences.append(
        f"Monitor progress over the next few sessions and adjust strategies "
        f"based on {name}'s response."
    )
    return " ".join(sentences)


# ── Category router ────────────────────────────────────────────────────────────

_BUILDERS = {
    "URGENT_SELF_HARM":              _urgent_self_harm,
    "PHYSICAL_AGGRESSION":           _physical_aggression,
    "BEHAVIORAL_FRUSTRATED":         _behavioral_frustrated,
    "BEHAVIORAL_ANXIOUS":            _behavioral_anxious,
    "BEHAVIORAL_SAD":                _behavioral_sad,
    "BEHAVIORAL_FATIGUED":           _behavioral_fatigued,
    "EXCELLENT_PERFORMANCE":         _excellent_performance,
    "ENTHUSIASM_MANAGEMENT":         _enthusiasm_management,
    "ANXIETY_SUPPORT":               _anxiety_support,
    "FRUSTRATION_HIGH_PARTICIPATION":_frustration_high,
    "FRUSTRATION_LOW_PARTICIPATION": _frustration_low,
    "FATIGUE_SUPPORT":               _fatigue_support,
    "EMOTIONAL_SUPPORT_SAD":         _emotional_support_sad,
    "GENERAL_MIXED":                 _general_mixed,
}


def build_recommendation(category: str, inputs: dict) -> str:
    """
    Returns a personalized recommendation string.

    Parameters
    ----------
    category : str
        The predicted category label from the model.
    inputs : dict
        The original session input fields:
          student_name, subject, mood, participation_level,
          incident_report, interventions_applied (tuple/list),
          positive_indicators (tuple/list),
          negative_indicators (tuple/list),
          teacher_remarks, observation_text
    """
    builder = _BUILDERS.get(category)
    if builder is None:
        return (
            f"{_name(inputs)} requires follow-up based on today's session. "
            f"Review observations with the support team and adjust strategies accordingly."
        )
    return builder(inputs)
