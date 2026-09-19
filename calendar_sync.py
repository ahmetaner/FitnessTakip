import datetime
import uuid

WORKOUTS = [
    "Gün 1", "Gün 2", "V-sit", "Gün 3", "Gün 4", "Front Lever", "Gün 5", "Muscle-up"
]

def create_schedule(start_date, days=30):
    schedule = []
    workout_index = 0
    consecutive_workout_days = 0

    for i in range(days):
        current_date = start_date + datetime.timedelta(days=i)
        
        if consecutive_workout_days == 2:
            consecutive_workout_days = 0
            # Dinlenme günü
            continue
            
        workout_name = WORKOUTS[workout_index % len(WORKOUTS)]
        workout_index += 1
        consecutive_workout_days += 1
        
        # Saatleri ayarlama (0 = Pazartesi, 6 = Pazar)
        if current_date.weekday() < 5:  # Hafta içi
            start_hour, start_minute = 21, 0
        else:  # Hafta sonu
            start_hour, start_minute = 12, 0
            
        start_datetime = datetime.datetime.combine(current_date, datetime.time(start_hour, start_minute))
        end_datetime = start_datetime + datetime.timedelta(hours=1, minutes=30)
        
        schedule.append({
            "summary": f"Antrenman: {workout_name}",
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat(),
            "date": current_date
        })
        
    return schedule

def generate_ics(schedule):
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Antigravity//Fitness Tracker//TR",
        "CALSCALE:GREGORIAN"
    ]
    
    for ev in schedule:
        dt_start = datetime.datetime.fromisoformat(ev['start']).strftime("%Y%m%dT%H%M%S")
        dt_end = datetime.datetime.fromisoformat(ev['end']).strftime("%Y%m%dT%H%M%S")
        
        uid = f"{uuid.uuid4()}@fitnesstracker"
        dt_stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        
        lines.extend([
            "BEGIN:VEVENT",
            f"SUMMARY:{ev['summary']}",
            f"DTSTART:{dt_start}",
            f"DTEND:{dt_end}",
            f"DTSTAMP:{dt_stamp}",
            f"UID:{uid}",
            "DESCRIPTION:2 gün idman 1 gün dinlenme rutini.",
            "BEGIN:VALARM",
            "TRIGGER:-PT60M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Antrenman Hatırlatıcısı",
            "END:VALARM",
            "END:VEVENT"
        ])
        
    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)
