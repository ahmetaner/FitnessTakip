import datetime
import uuid


def create_schedule(start_date, workouts_list, days=30):
    schedule = []
    workout_index = 0
    end_date = start_date + datetime.timedelta(days=days)
    current_date = start_date

    while current_date < end_date:
        workout_name = workouts_list[workout_index % len(workouts_list)]
        
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
        
        if (workout_index % len(workouts_list)) in [1, 3, 6]:
            current_date += datetime.timedelta(days=2)
        else:
            current_date += datetime.timedelta(days=1)
            
        workout_index += 1
        
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
