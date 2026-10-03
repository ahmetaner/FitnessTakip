from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import datetime

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data.json")

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Migration/defaults
            if "next_workout_idx" not in data:
                data["next_workout_idx"] = 0
            if "expected_next_date" not in data:
                data["expected_next_date"] = datetime.date.today().isoformat()
            if "completed_history" not in data:
                data["completed_history"] = []
            if "missed_history" not in data:
                data["missed_history"] = []
            if "workouts" not in data:
                data["workouts"] = ["push", "pull", "leg", "upper", "lower", "v-sit", "muscle up"]
            if "streak" not in data:
                data["streak"] = 0
            if "max_streak" not in data:
                data["max_streak"] = data.get("streak", 0)
            return data
    return {
        "streak": 0,
        "max_streak": 0,
        "last_completed_date": None,
        "next_workout_idx": 0,
        "expected_next_date": datetime.date.today().isoformat(),
        "workouts": ["push", "pull", "leg", "upper", "lower", "v-sit", "muscle up"],
        "completed_history": [],
        "missed_history": []
    }

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def generate_schedule_list(start_date_str, next_idx, workouts_list, days=60):
    schedule = []
    current_date = datetime.date.fromisoformat(start_date_str)
    today = datetime.date.today()
    if current_date < today:
        current_date = today
    end_date = today + datetime.timedelta(days=days)
    idx = next_idx
    
    while current_date <= end_date:
        workout_name = workouts_list[idx % len(workouts_list)]
        schedule.append({
            "date": current_date.isoformat(),
            "title": workout_name,
            "idx": idx % len(workouts_list),
            "is_today": current_date == today
        })
        if (idx % len(workouts_list)) in [1, 3, 6]:
            current_date += datetime.timedelta(days=2) # 1 gün idman, sonraki gün boş
        else:
            current_date += datetime.timedelta(days=1)
        idx += 1
    return schedule

@app.route("/")
def index():
    data = load_data()
    today = datetime.date.today()
    expected_next = datetime.date.fromisoformat(data["expected_next_date"])
    workouts_list = data["workouts"]
    
    missed_workout = None
    if expected_next < today:
        missed_workout = {
            "date": expected_next.isoformat(),
            "name": workouts_list[data["next_workout_idx"] % len(workouts_list)]
        }
    
    schedule = generate_schedule_list(data["expected_next_date"], data["next_workout_idx"], workouts_list)
    todays_workout = next((ev for ev in schedule if ev["is_today"]), None)
    is_completed_today = data.get("last_completed_date") == today.isoformat()
    
    # Prepare calendar events
    calendar_events = []
    for h in data.get("completed_history", []):
        calendar_events.append({
            "title": h["title"] + " ✅",
            "start": h["date"],
            "allDay": True,
            "backgroundColor": "#10b981", # green-500
            "borderColor": "#10b981"
        })
    for ev in schedule:
        calendar_events.append({
            "title": "🏋️ " + ev["title"],
            "start": ev["date"],
            "allDay": True,
            "backgroundColor": "#3b82f6" if ev["is_today"] else "#64748b", # blue if today, slate if future
            "borderColor": "#3b82f6" if ev["is_today"] else "#64748b"
        })
    
    # Stats calculation
    thirty_days_ago = (today - datetime.timedelta(days=30)).isoformat()
    completed_30 = [h for h in data.get("completed_history", []) if h["date"] >= thirty_days_ago]
    missed_30 = [h for h in data.get("missed_history", []) if h["date"] >= thirty_days_ago]
    total_30 = len(completed_30) + len(missed_30)
    rate_30 = int((len(completed_30) / total_30 * 100)) if total_30 > 0 else 0
    
    one_year_ago = (today - datetime.timedelta(days=365)).isoformat()
    completed_365 = [h for h in data.get("completed_history", []) if h["date"] >= one_year_ago]
    missed_365 = [h for h in data.get("missed_history", []) if h["date"] >= one_year_ago]
    total_365 = len(completed_365) + len(missed_365)
    rate_365 = int((len(completed_365) / total_365 * 100)) if total_365 > 0 else 0

    stats = {
        "c_30": len(completed_30), "m_30": len(missed_30), "r_30": rate_30,
        "c_365": len(completed_365), "m_365": len(missed_365), "r_365": rate_365
    }

    return render_template("index.html", 
                           data=data, 
                           today=today.isoformat(),
                           missed_workout=missed_workout,
                           todays_workout=todays_workout,
                           is_completed_today=is_completed_today,
                           schedule=schedule[:10],
                           stats=stats,
                           calendar_events=calendar_events)

@app.route("/api/data", methods=["GET", "POST", "OPTIONS"])
def api_data():
    if request.method == "OPTIONS":
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        return ('', 204, headers)
        
    if request.method == "GET":
        data = load_data()
        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    elif request.method == "POST":
        new_data = request.json
        if new_data:
            save_data(new_data)
            response = jsonify({"status": "success"})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
        return jsonify({"status": "error"}), 400

@app.route("/api/action", methods=["POST"])
def do_action():
    action = request.form.get("action")
    data = load_data()
    today = datetime.date.today()
    workouts_list = data["workouts"]
    expected_next = datetime.date.fromisoformat(data["expected_next_date"])
    
    if action == "missed_yes":
        missed_name = workouts_list[data["next_workout_idx"] % len(workouts_list)]
        data["last_completed_date"] = expected_next.isoformat()
        data["completed_history"].append({"title": f"Antrenman: {missed_name}", "date": expected_next.isoformat()})
        data["streak"] += 1
        data["max_streak"] = max(data.get("max_streak", 0), data["streak"])
        
        curr_mod = data["next_workout_idx"] % len(workouts_list)
        delta = 2 if curr_mod in [1, 3, 6] else 1
        data["expected_next_date"] = (expected_next + datetime.timedelta(days=delta)).isoformat()
        data["next_workout_idx"] = (data["next_workout_idx"] + 1) % len(workouts_list)
        save_data(data)
        
    elif action == "missed_no":
        missed_name = workouts_list[data["next_workout_idx"] % len(workouts_list)]
        data["missed_history"].append({"title": f"Antrenman: {missed_name}", "date": expected_next.isoformat()})
        data["expected_next_date"] = today.isoformat()
        data["streak"] = 0
        save_data(data)
        
    elif action == "complete_today":
        actual_workout = request.form.get("actual_workout")
        current_idx = data["next_workout_idx"] % len(workouts_list)
        scheduled_name = workouts_list[current_idx]
        
        data["streak"] += 1
        data["max_streak"] = max(data.get("max_streak", 0), data["streak"])
        data["last_completed_date"] = today.isoformat()
        data["completed_history"].append({"title": f"Antrenman: {actual_workout}", "date": today.isoformat()})
        
        if actual_workout != scheduled_name:
            swap_idx = workouts_list.index(actual_workout)
            workouts_list[current_idx], workouts_list[swap_idx] = workouts_list[swap_idx], workouts_list[current_idx]
            data["workouts"] = workouts_list
            
        curr_mod = data["next_workout_idx"] % len(workouts_list)
        delta = 2 if curr_mod in [1, 3, 6] else 1
        data["expected_next_date"] = (today + datetime.timedelta(days=delta)).isoformat()
        data["next_workout_idx"] = (data["next_workout_idx"] + 1) % len(workouts_list)
        save_data(data)
        
    elif action == "postpone":
        if data.get("last_completed_date") != today.isoformat():
            data["expected_next_date"] = (today + datetime.timedelta(days=1)).isoformat()
            data["streak"] = 0
            save_data(data)
            
    elif action == "update_workouts":
        new_w = [request.form.get(f"w_{i}") for i in range(7)]
        if all(new_w):
            data["workouts"] = new_w
            save_data(data)

    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
