import streamlit as st
import datetime
import json
import os
from streamlit_calendar import calendar
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

DATA_FILE = "data.json"
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

st.set_page_config(page_title="Fitness Tracker", page_icon="💪", layout="wide")

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
            # Migration from old format if needed
            if "next_workout_idx" not in data:
                data["next_workout_idx"] = 5
                
                data["expected_next_date"] = "2026-09-08"
                data["completed_history"] = [{"title": "Antrenman: Gün 4", "date": "2026-09-07"}]
            if "max_streak" not in data:
                data["max_streak"] = data.get("streak", 0)
            if "missed_history" not in data:
                data["missed_history"] = []
            return data
    return {
        "streak": 0,
        "max_streak": 0,
        "last_completed_date": None,
        "next_workout_idx": 0,
        
        "expected_next_date": datetime.date.today().isoformat(),
        "completed_history": [],
        "missed_history": []
    }

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

def auto_sync_to_google(schedule):
    if not os.path.exists("credentials.json"):
        return False
    
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception:
                flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
                creds = flow.run_local_server(port=0)
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
            
    try:
        service = build("calendar", "v3", credentials=creds)
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = service.events().list(calendarId='primary', timeMin=now, q="Antrenman:", singleEvents=True).execute()
        events = events_result.get('items', [])
        for event in events:
            if any(w in event.get('summary', '') for w in WORKOUTS):
                service.events().delete(calendarId='primary', eventId=event['id']).execute()
            
        added_count = 0
        for ev in schedule:
            if added_count >= 30:
                break
            event_body = {
                'summary': ev['title'],
                'start': {'dateTime': ev['start'], 'timeZone': 'Europe/Istanbul'},
                'end': {'dateTime': ev['end'], 'timeZone': 'Europe/Istanbul'},
                'reminders': {'useDefault': False, 'overrides': [{'method': 'popup', 'minutes': 60}]},
            }
            service.events().insert(calendarId='primary', body=event_body).execute()
            added_count += 1
        return True
    except Exception as e:
        return False

def generate_future_schedule(start_date_str, next_workout_idx, workouts_list, days=90):
    schedule = []
    current_date = datetime.date.fromisoformat(start_date_str)
    idx = next_workout_idx
    
    today = datetime.date.today()
    if current_date < today:
        current_date = today
        
    end_date = today + datetime.timedelta(days=days)
    
    while current_date <= end_date:
        workout_name = workouts_list[idx % len(workouts_list)]
        
        if current_date.weekday() < 5:
            start_hour, start_minute = 21, 0
        else:
            start_hour, start_minute = 12, 0
            
        start_datetime = datetime.datetime.combine(current_date, datetime.time(start_hour, start_minute))
        end_datetime = start_datetime + datetime.timedelta(hours=1, minutes=30)
        
        schedule.append({
            "title": f"Antrenman: {workout_name}",
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat(),
            "backgroundColor": "#FF4B4B" if current_date == today else "#4CAF50",
            "date_obj": current_date,
            "idx": idx % len(workouts_list)
        })
        
        if (idx % len(workouts_list)) in [1, 3, 6]:
            current_date += datetime.timedelta(days=2)
        else:
            current_date += datetime.timedelta(days=1)
            
        idx += 1
        
    return schedule

def main():
    data = load_data()
    today = datetime.date.today()
    workouts_list = data.get("workouts", ["push", "pull", "leg", "upper", "lower", "v-sit", "muscle up"])
    
    st.title("💪 Fitness Takip ve Takvim Uygulaması")
    
    # 1. Eksik Antrenman Kontrolü
    expected_next = datetime.date.fromisoformat(data["expected_next_date"])
    
    if expected_next < today:
        st.markdown("---")
        st.error("⚠️ Eksik Antrenman Bildirimi")
        missed_workout_name = WORKOUTS[data["next_workout_idx"]]
        st.write(f"Geçmişte yapmanız gereken bir antrenman tespit edildi: **{expected_next.strftime('%Y-%m-%d')} - Antrenman: {missed_workout_name}**")
        st.write("Bu antrenmanı o gün yaptınız mı? (Hayır derseniz, dinlenmiş sayılacaksınız; antrenman bugüne alınacak ve ardından gelecek antrenmanlara yeni bir 2-idman 1-dinlenme döngüsü uygulanacaktır.)")
        
        col_y, col_n = st.columns(2)
        with col_y:
            if st.button("Evet, Yaptım ✅", key="missed_yes"):
                data["last_completed_date"] = expected_next.isoformat()
                data["completed_history"].append({"title": f"Antrenman: {missed_workout_name}", "date": expected_next.isoformat()})
                data["streak"] += 1
                if data["streak"] > data.get("max_streak", 0):
                    data["max_streak"] = data["streak"]
                curr_mod = data["next_workout_idx"] % len(workouts_list)
                if curr_mod in [1, 3, 6]:
                    data["expected_next_date"] = (expected_next + datetime.timedelta(days=2)).isoformat()
                else:
                    data["expected_next_date"] = (expected_next + datetime.timedelta(days=1)).isoformat()
                data["next_workout_idx"] = (data["next_workout_idx"] + 1) % len(workouts_list)
                save_data(data)
                st.rerun()
        with col_n:
            if st.button("Hayır, Yapmadım ❌", key="missed_no"):
                data["missed_history"].append({"title": f"Antrenman: {missed_workout_name}", "date": expected_next.isoformat()})
                data["expected_next_date"] = today.isoformat()
                
                data["streak"] = 0
                save_data(data)
                new_schedule = generate_future_schedule(data["expected_next_date"], data["next_workout_idx"], workouts_list)
                if os.path.exists("credentials.json"):
                    auto_sync_to_google(new_schedule)
                st.rerun()
        st.stop()
        
    # 2. Ana Arayüz
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("🔥 Streak (Seri)", f"{data['streak']} Gün", delta=f"Max: {data.get('max_streak', data['streak'])} Gün", delta_color="off")
    with col2:
        st.write("Döngü her zaman '2 Gün İdman, 1 Gün Dinlenme' şeklindedir.")
    with col3:
        if st.button("🔄 Google Takvim ile Senkronize Et", use_container_width=True):
            with st.spinner("Takvim güncelleniyor..."):
                schedule = generate_future_schedule(data["expected_next_date"], data["next_workout_idx"], workouts_list)
                if auto_sync_to_google(schedule):
                    st.success("Başarılı!")
                else:
                    st.error("credentials.json bulunamadı veya yetkilendirme hatası.")
                    
    schedule = generate_future_schedule(data["expected_next_date"], data["next_workout_idx"], workouts_list)
    todays_workout = next((ev for ev in schedule if ev["date_obj"] == today), None)
    
    st.markdown("---")
    if todays_workout:
        st.subheader(f"🏋️ Bugünün Antrenmanı")
        is_completed_today = data.get("last_completed_date") == today.isoformat()
        if not is_completed_today:
            current_idx = data["next_workout_idx"] % len(workouts_list)
            scheduled_name = workouts_list[current_idx]
            actual_workout = st.selectbox("Bugün planlanan antrenman (Farklı bir idman seçerseniz, bugünkü ile yer değiştirir):", options=workouts_list, index=current_idx)
            if st.button("✅ Antrenmanı Tamamla (Streak +1)", use_container_width=True):
                data["streak"] += 1
                if data["streak"] > data.get("max_streak", 0):
                    data["max_streak"] = data["streak"]
                data["last_completed_date"] = today.isoformat()
                data["completed_history"].append({"title": f"Antrenman: {actual_workout}", "date": today.isoformat()})

                if actual_workout != scheduled_name:
                    swap_idx = workouts_list.index(actual_workout)
                    workouts_list[current_idx], workouts_list[swap_idx] = workouts_list[swap_idx], workouts_list[current_idx]
                    data["workouts"] = workouts_list

                curr_mod = data["next_workout_idx"] % len(workouts_list)
                if curr_mod in [1, 3, 6]:
                    data["expected_next_date"] = (today + datetime.timedelta(days=2)).isoformat()
                else:
                    data["expected_next_date"] = (today + datetime.timedelta(days=1)).isoformat()
                data["next_workout_idx"] = (data["next_workout_idx"] + 1) % len(workouts_list)
                save_data(data)
                
                new_schedule = generate_future_schedule(data["expected_next_date"], data["next_workout_idx"], workouts_list)
                if os.path.exists("credentials.json"):
                    auto_sync_to_google(new_schedule)
                st.rerun()
        else:
            st.success("Bugünkü antrenmanı tamamladınız! Harika iş çıkardınız.")
    else:
        st.subheader("Bugün dinlenme gününüz. Tadını çıkarın! 😴")
        
    st.markdown("---")
    
    if st.button("⚠️ Bugünü Ertele (Antrenmanı yarına kaydır)", use_container_width=True):
        if todays_workout and data.get("last_completed_date") != today.isoformat():
            data["expected_next_date"] = (today + datetime.timedelta(days=1)).isoformat()
            
            data["streak"] = 0
            save_data(data)
            new_schedule = generate_future_schedule(data["expected_next_date"], data["next_workout_idx"], workouts_list)
            if os.path.exists("credentials.json"):
                auto_sync_to_google(new_schedule)
            st.rerun()
        else:
            st.warning("Bugün zaten dinlenme günü veya antrenman tamamlandı.")
            
    st.subheader("📊 İstatistikler")
    
    thirty_days_ago = today - datetime.timedelta(days=30)
    completed_last_30 = [h for h in data.get("completed_history", []) if datetime.date.fromisoformat(h["date"]) >= thirty_days_ago]
    missed_last_30 = [h for h in data.get("missed_history", []) if datetime.date.fromisoformat(h["date"]) >= thirty_days_ago]
    
    total_30 = len(completed_last_30) + len(missed_last_30)
    success_rate_30 = (len(completed_last_30) / total_30 * 100) if total_30 > 0 else 0
    
    one_year_ago = today - datetime.timedelta(days=365)
    completed_last_365 = [h for h in data.get("completed_history", []) if datetime.date.fromisoformat(h["date"]) >= one_year_ago]
    missed_last_365 = [h for h in data.get("missed_history", []) if datetime.date.fromisoformat(h["date"]) >= one_year_ago]
    
    total_365 = len(completed_last_365) + len(missed_last_365)
    success_rate_365 = (len(completed_last_365) / total_365 * 100) if total_365 > 0 else 0
    
    stat_col1, stat_col2 = st.columns(2)
    with stat_col1:
        st.markdown("**Son 30 Gün**")
        st.write(f"✅ Tamamlanan: {len(completed_last_30)} | ❌ Kaçırılan: {len(missed_last_30)}")
        st.progress(int(success_rate_30) / 100, text=f"Başarı Oranı: %{int(success_rate_30)}")
        
    with stat_col2:
        st.markdown("**Son 1 Yıl**")
        st.write(f"✅ Tamamlanan: {len(completed_last_365)} | ❌ Kaçırılan: {len(missed_last_365)}")
        st.progress(int(success_rate_365) / 100, text=f"Başarı Oranı: %{int(success_rate_365)}")
        
    st.markdown("---")
    st.subheader("Aylık Takvim Görünümü")
    
    calendar_events = []
    for h in data.get("completed_history", []):
        calendar_events.append({
            "title": h["title"] + " ✅",
            "start": h["date"] + "T12:00:00",
            "end": h["date"] + "T13:30:00",
            "backgroundColor": "#1e88e5"
        })
        
    for ev in schedule:
        calendar_events.append({
            "title": ev["title"],
            "start": ev["start"],
            "end": ev["end"],
            "backgroundColor": ev["backgroundColor"]
        })
        
    calendar_options = {
        "headerToolbar": {
            "left": "today prev,next",
            "center": "title",
            "right": "dayGridMonth,timeGridWeek"
        },
        "initialView": "dayGridMonth",
    }
    
    calendar(events=calendar_events, options=calendar_options)
    
    st.markdown("---")
    st.markdown("---")
    with st.expander("🛠️ Programı Düzenle (Antrenman Sıralamasını Değiştir)"):
        st.write("Döngünüzdeki 7 antrenmanın ismini veya sırasını tablodan düzenleyebilirsiniz:")
        
        list_of_dicts = [{"Antrenman Adı": w} for w in workouts_list]
        edited_data = st.data_editor(list_of_dicts, use_container_width=True, num_rows="fixed")
        new_workouts = [item["Antrenman Adı"] for item in edited_data]
        
        if new_workouts != workouts_list:
            if st.button("💾 Döngüyü Güncelle"):
                data["workouts"] = new_workouts
                save_data(data)
                new_schedule = generate_future_schedule(data["expected_next_date"], data["next_workout_idx"], new_workouts)
                if os.path.exists("credentials.json"):
                    auto_sync_to_google(new_schedule)
                st.rerun()

    st.subheader("🗓️ Mevcut İdman Döngüsü (10 Günlük Plan)")
    st.write("Döngünüz **2 idman-1 dinlenme, 2 idman-1 dinlenme, 3 idman-1 dinlenme** kuralına göre aşağıdaki gibi tam 10 günde bir başa sarar:")
    
    row1 = st.columns(5)
    row2 = st.columns(5)
    w_idx = 0
    for i in range(10):
        day = i + 1
        col = row1[i] if i < 5 else row2[i - 5]
        
        if i in [2, 5, 9]:
            col.info(f"**Gün {day}**\n\n🛋️ Dinlenme")
        else:
            col.success(f"**Gün {day}**\n\n🏋️ {workouts_list[w_idx % len(workouts_list)]}")
            w_idx += 1



if __name__ == "__main__":
    main()
