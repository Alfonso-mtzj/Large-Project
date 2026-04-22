import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ── Helper ────────────────────────────────────────────────────────────────────
String _dateKey(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

// ── Dashboard Screen ──────────────────────────────────────────────────────────
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int level = 1;
  int xp = 0;
  int maxXp = 100;
  String username = '';
  bool _dataLoaded = false;

  // Date-keyed stats  key = 'YYYY-MM-DD'
  // intelligence: Map<String, int>  (minutes per day)
  // strength:     Map<String, int>  (minutes per day)
  // health:       Map<String, Map>  {waterOz, calories, meals: [], vitaminTaken}
  Map<String, int> intelligenceByDay = {};
  Map<String, int> strengthByDay = {};
  Map<String, Map<String, dynamic>> healthByDay = {};

  // Friends
  final friendController = TextEditingController();
  List<Map<String, dynamic>> friends = [];

  // Planner
  String? selectedFriend;
  final planActivityController = TextEditingController();
  DateTime? planDate;
  TimeOfDay? planStart;
  TimeOfDay? planEnd;
  List<Map<String, dynamic>> plans = [];

  // ── Helpers for today ────────────────────────────────────────────────────
  String get _todayKey => _dateKey(DateTime.now());

  int get intelligenceTotalMinutes => intelligenceByDay[_todayKey] ?? 0;
  int get strengthTotalMinutes => strengthByDay[_todayKey] ?? 0;

  Map<String, dynamic> get _todayHealth =>
      healthByDay[_todayKey] ?? {'waterOz': 0, 'calories': 0, 'meals': <String>[], 'vitaminTaken': false};

  int get totalWaterOz => (_todayHealth['waterOz'] as int?) ?? 0;
  int get totalCalories => (_todayHealth['calories'] as int?) ?? 0;
  List<String> get meals => List<String>.from(_todayHealth['meals'] ?? []);
  bool get vitaminTaken => (_todayHealth['vitaminTaken'] as bool?) ?? false;

  // ── Lifecycle ────────────────────────────────────────────────────────────
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args != null && !_dataLoaded) {
      username = args as String;
      _dataLoaded = true;
      _loadData();
    }
  }

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    final k = username;
    setState(() {
      level  = prefs.getInt('$k.level')  ?? 1;
      xp     = prefs.getInt('$k.xp')     ?? 0;
      maxXp  = prefs.getInt('$k.maxXp')  ?? 100;

      final intelJson = prefs.getString('$k.intelligenceByDay');
      if (intelJson != null) {
        intelligenceByDay = Map<String, int>.from(jsonDecode(intelJson));
      }

      final strengthJson = prefs.getString('$k.strengthByDay');
      if (strengthJson != null) {
        strengthByDay = Map<String, int>.from(jsonDecode(strengthJson));
      }

      final healthJson = prefs.getString('$k.healthByDay');
      if (healthJson != null) {
        final raw = jsonDecode(healthJson) as Map<String, dynamic>;
        healthByDay = raw.map((date, val) {
          final m = Map<String, dynamic>.from(val);
          m['meals'] = List<String>.from(m['meals'] ?? []);
          return MapEntry(date, m);
        });
      }

      final friendsJson = prefs.getString('$k.friends');
      if (friendsJson != null) {
        friends = List<Map<String, dynamic>>.from(
            jsonDecode(friendsJson).map((f) => Map<String, dynamic>.from(f)));
        if (friends.isNotEmpty) selectedFriend = friends.first['name'] as String;
      }

      final plansJson = prefs.getString('$k.plans');
      if (plansJson != null) {
        final rawPlans = jsonDecode(plansJson) as List;
        plans = rawPlans.map((p) {
          final map = Map<String, dynamic>.from(p);
          map['date'] = DateTime.parse(map['date'] as String);
          return map;
        }).toList();
      }
    });
  }

  Future<void> _saveData() async {
    final prefs = await SharedPreferences.getInstance();
    final k = username;
    await prefs.setInt('$k.level', level);
    await prefs.setInt('$k.xp', xp);
    await prefs.setInt('$k.maxXp', maxXp);
    await prefs.setString('$k.intelligenceByDay', jsonEncode(intelligenceByDay));
    await prefs.setString('$k.strengthByDay', jsonEncode(strengthByDay));
    await prefs.setString('$k.healthByDay', jsonEncode(healthByDay));
    await prefs.setString('$k.friends', jsonEncode(friends));
    await prefs.setString('$k.plans', jsonEncode(
      plans.map((p) {
        final map = Map<String, dynamic>.from(p);
        map['date'] = (map['date'] as DateTime).toIso8601String();
        return map;
      }).toList(),
    ));
  }

  // ── XP ───────────────────────────────────────────────────────────────────
  void gainXp(int amount) {
    setState(() {
      xp += amount;
      while (xp >= maxXp) { xp -= maxXp; level++; maxXp = (maxXp * 1.04).round(); }
    });
    _saveData();
  }

  void gainFriendXp(String friendName, int amount) {
    setState(() {
      final idx = friends.indexWhere((f) => f['name'] == friendName);
      if (idx == -1) return;
      friends[idx]['xp'] += amount;
      while (friends[idx]['xp'] >= friends[idx]['maxXp']) {
        friends[idx]['xp'] -= friends[idx]['maxXp'];
        friends[idx]['level'] += 1;
        friends[idx]['maxXp'] = (friends[idx]['maxXp'] * 1.04).round();
      }
    });
    _saveData();
  }

  // ── Health helpers ───────────────────────────────────────────────────────
  Map<String, dynamic> _healthForDay(String dateKey) {
    return healthByDay[dateKey] ??
        {'waterOz': 0, 'calories': 0, 'meals': <String>[], 'vitaminTaken': false};
  }

  void _updateHealth(String dateKey, Map<String, dynamic> updated) {
    setState(() => healthByDay[dateKey] = updated);
    _saveData();
  }

  // ── Dialogs ──────────────────────────────────────────────────────────────
  void _showAddWaterDialog({String? forDate}) {
    final ozController = TextEditingController();
    final dk = forDate ?? _todayKey;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1208),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text("Add Water", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 16, fontWeight: FontWeight.bold)),
        content: _numField(ozController, "Ounces (oz)"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () {
              final oz = int.tryParse(ozController.text) ?? 0;
              if (oz > 0) {
                final h = _healthForDay(dk);
                h['waterOz'] = (h['waterOz'] as int) + oz;
                _updateHealth(dk, h);
              }
              Navigator.pop(ctx);
            },
            child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showLogFoodDialog({String? forDate}) {
    final foodController = TextEditingController();
    final caloriesController = TextEditingController();
    bool showCalories = false;
    final dk = forDate ?? _todayKey;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDS) => AlertDialog(
          backgroundColor: const Color(0xFF1a1208),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text("Log Food", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 16, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _textField(foodController, "What did you eat?"),
              const SizedBox(height: 10),
              Row(children: [
                Checkbox(value: showCalories, onChanged: (v) => setDS(() => showCalories = v ?? false), activeColor: Colors.amber, checkColor: Colors.black, side: const BorderSide(color: Colors.amber)),
                Text("Add calories?", style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0))),
              ]),
              if (showCalories) ...[const SizedBox(height: 8), _numField(caloriesController, "Calories")],
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              onPressed: () {
                if (foodController.text.isNotEmpty) {
                  final cal = int.tryParse(caloriesController.text) ?? 0;
                  final entry = showCalories && cal > 0 ? '${foodController.text.trim()} (${cal} cal)' : foodController.text.trim();
                  final h = _healthForDay(dk);
                  final mealList = List<String>.from(h['meals'] ?? []);
                  mealList.add(entry);
                  h['meals'] = mealList;
                  h['calories'] = (h['calories'] as int) + cal;
                  _updateHealth(dk, h);
                  gainXp(5);
                }
                Navigator.pop(ctx);
              },
              child: Text("Log", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddStudyTimeDialog({String? forDate}) {
    final hoursCtrl = TextEditingController();
    final minsCtrl = TextEditingController();
    final dk = forDate ?? _todayKey;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1208),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text("Add Study Time", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 16, fontWeight: FontWeight.bold)),
        content: _hhmmRow(hoursCtrl, minsCtrl),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () {
              final h = int.tryParse(hoursCtrl.text) ?? 0;
              final m = int.tryParse(minsCtrl.text) ?? 0;
              if (h > 0 || m > 0) {
                final added = h * 60 + m;
                setState(() {
                  final current = intelligenceByDay[dk] ?? 0;
                  int newVal = current + added;
                  if (newVal >= 3600) { newVal = newVal - 3600; gainXp(50); }
                  intelligenceByDay[dk] = newVal;
                });
                gainXp(10);
                _saveData();
              }
              Navigator.pop(ctx);
            },
            child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAddStrengthTimeDialog({String? forDate}) {
    final hoursCtrl = TextEditingController();
    final minsCtrl = TextEditingController();
    final dk = forDate ?? _todayKey;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1208),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text("Add Activity Time", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 16, fontWeight: FontWeight.bold)),
        content: _hhmmRow(hoursCtrl, minsCtrl),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () {
              final h = int.tryParse(hoursCtrl.text) ?? 0;
              final m = int.tryParse(minsCtrl.text) ?? 0;
              if (h > 0 || m > 0) {
                final added = h * 60 + m;
                setState(() {
                  final current = strengthByDay[dk] ?? 0;
                  int newVal = current + added;
                  if (newVal >= 3600) { newVal = newVal - 3600; gainXp(50); }
                  strengthByDay[dk] = newVal;
                });
                gainXp(8);
                _saveData();
              }
              Navigator.pop(ctx);
            },
            child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ── Reusable field builders ───────────────────────────────────────────────
  Widget _numField(TextEditingController ctrl, String label) => TextField(
    controller: ctrl, keyboardType: TextInputType.number,
    style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 20),
    textAlign: TextAlign.center,
    decoration: _inputDeco(label),
  );

  Widget _textField(TextEditingController ctrl, String label) => TextField(
    controller: ctrl,
    style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 16),
    decoration: _inputDeco(label),
  );

  Widget _hhmmRow(TextEditingController h, TextEditingController m) => Row(
    children: [
      Expanded(child: TextField(controller: h, keyboardType: TextInputType.number, maxLength: 2, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 22), textAlign: TextAlign.center, decoration: _inputDeco("HH").copyWith(counterText: ''))),
      Padding(padding: const EdgeInsets.symmetric(horizontal: 8), child: Text(":", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 24))),
      Expanded(child: TextField(controller: m, keyboardType: TextInputType.number, maxLength: 2, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 22), textAlign: TextAlign.center, decoration: _inputDeco("MM").copyWith(counterText: ''))),
    ],
  );

  InputDecoration _inputDeco(String label) => InputDecoration(
    labelText: label,
    labelStyle: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6), fontSize: 12),
    filled: true, fillColor: Colors.white.withOpacity(0.07),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFF5E8B0), width: 1.5)),
  );

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final xpPercent = xp / maxXp;
    final intelMins = intelligenceTotalMinutes;
    final strengthMins = strengthTotalMinutes;

    return Scaffold(
      body: Stack(
        children: [
          SizedBox.expand(child: Image.asset('assets/dashboard.png', fit: BoxFit.cover)),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                children: [

                  // ── Top nav ──────────────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _navButton("🏠", "Home", () => Navigator.pushReplacementNamed(context, '/login')),
                      const SizedBox(width: 12),
                      _navButton("📅", "Calendar", () {
                        Navigator.push(context, MaterialPageRoute(
                          builder: (_) => CalendarScreen(
                            plans: plans,
                            intelligenceByDay: intelligenceByDay,
                            strengthByDay: strengthByDay,
                            healthByDay: healthByDay,
                            friends: friends,
                            today: DateTime.now(),
                            onDataChanged: (updatedPlans, updatedIntel, updatedStrength, updatedHealth) {
                              setState(() {
                                plans = updatedPlans;
                                intelligenceByDay = updatedIntel;
                                strengthByDay = updatedStrength;
                                healthByDay = updatedHealth;
                              });
                              _saveData();
                            },
                          ),
                        ));
                      }),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // ── Header ───────────────────────────────────────────────
                  _Card(child: Column(children: [
                    Text(username.isNotEmpty ? '@$username' : 'Dashboard',
                        style: GoogleFonts.cinzelDecorative(fontSize: 26, color: const Color(0xFFF5E8B0), fontWeight: FontWeight.w900), textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    Text("Level $level", style: GoogleFonts.cinzel(fontSize: 18, color: const Color(0xFFF5E8B0))),
                    const SizedBox(height: 8),
                    ClipRRect(borderRadius: BorderRadius.circular(8), child: LinearProgressIndicator(value: xpPercent, minHeight: 14, color: Colors.amber, backgroundColor: Colors.brown.shade800)),
                    const SizedBox(height: 4),
                    Text("$xp / $maxXp XP", style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0).withOpacity(0.6))),
                  ])),

                  const SizedBox(height: 14),

                  // ── Intelligence + Strength ──────────────────────────────
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(child: _Card(child: Column(children: [
                      Text("🧠 Intelligence", style: GoogleFonts.cinzel(fontSize: 15, color: Colors.amber)),
                      const SizedBox(height: 8),
                      Text(_fmtMins(intelMins), style: GoogleFonts.crimsonText(fontSize: 20, fontWeight: FontWeight.bold, color: intelMins > 0 ? const Color(0xFFF5E8B0) : const Color(0xFFF5E8B0).withOpacity(0.4))),
                      const SizedBox(height: 8),
                      _GreenButton(label: "+ Add Time", onPressed: _showAddStudyTimeDialog),
                    ]))),
                    const SizedBox(width: 12),
                    Expanded(child: _Card(child: Column(children: [
                      Text("💪 Strength", style: GoogleFonts.cinzel(fontSize: 15, color: Colors.amber)),
                      const SizedBox(height: 8),
                      Text(_fmtMins(strengthMins), style: GoogleFonts.crimsonText(fontSize: 20, fontWeight: FontWeight.bold, color: strengthMins > 0 ? const Color(0xFFF5E8B0) : const Color(0xFFF5E8B0).withOpacity(0.4))),
                      const SizedBox(height: 8),
                      _GreenButton(label: "+ Add Time", onPressed: _showAddStrengthTimeDialog),
                    ]))),
                  ]),

                  const SizedBox(height: 14),

                  // ── Health + Add Friend ───────────────────────────────────
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(child: _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text("🍎 Health", style: GoogleFonts.cinzel(fontSize: 15, color: Colors.amber)),
                      const SizedBox(height: 10),
                      Text("Vitamins Taken?", style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0))),
                      Checkbox(
                        value: vitaminTaken,
                        onChanged: (v) {
                          final h = _healthForDay(_todayKey);
                          h['vitaminTaken'] = v ?? false;
                          _updateHealth(_todayKey, h);
                        },
                        activeColor: Colors.amber, checkColor: Colors.black, side: const BorderSide(color: Colors.amber),
                      ),
                      const SizedBox(height: 4),
                      Text("💧 $totalWaterOz oz", style: GoogleFonts.crimsonText(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFFF5E8B0))),
                      const SizedBox(height: 6),
                      _GreenButton(label: "+ Add Water", onPressed: _showAddWaterDialog),
                      const SizedBox(height: 8),
                      _GreenButton(label: "Log Food", onPressed: _showLogFoodDialog),
                      if (totalCalories > 0) ...[
                        const SizedBox(height: 8),
                        Text("Total: $totalCalories cal", style: GoogleFonts.cinzel(fontSize: 12, color: Colors.amber)),
                      ],
                    ]))),
                    const SizedBox(width: 12),
                    Expanded(child: _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text("👥 Add Friend", style: GoogleFonts.cinzel(fontSize: 15, color: Colors.amber)),
                      const SizedBox(height: 10),
                      _DTextField(controller: friendController, hint: "Friend's Name"),
                      const SizedBox(height: 10),
                      _GreenButton(label: "Add Friend", onPressed: () {
                        if (friendController.text.isNotEmpty) {
                          final name = friendController.text.trim();
                          setState(() {
                            friends.add({'name': name, 'xp': 0, 'level': 1, 'maxXp': 50});
                            selectedFriend ??= name;
                            friendController.clear();
                          });
                          _saveData();
                        }
                      }),
                    ]))),
                  ]),

                  const SizedBox(height: 14),

                  // ── Planner + Relationships ───────────────────────────────
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(child: _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text("📅 Planner", style: GoogleFonts.cinzel(fontSize: 15, color: Colors.amber)),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
                        child: DropdownButton<String>(
                          value: selectedFriend,
                          hint: Text("Select Friend", style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0).withOpacity(0.5))),
                          isExpanded: true, underline: const SizedBox(), dropdownColor: const Color(0xFF1a1208),
                          style: GoogleFonts.crimsonText(color: const Color(0xFFF5E8B0), fontSize: 14),
                          items: friends.map((f) => DropdownMenuItem(value: f['name'] as String, child: Text(f['name'] as String))).toList(),
                          onChanged: (v) => setState(() => selectedFriend = v),
                        ),
                      ),
                      const SizedBox(height: 8),
                      _DTextField(controller: planActivityController, hint: "What are you doing?"),
                      const SizedBox(height: 8),
                      _PickerRow(icon: Icons.calendar_today, label: planDate == null ? "Pick a date" : "${planDate!.month}/${planDate!.day}/${planDate!.year}", onTap: () async {
                        final picked = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2100));
                        if (picked != null) setState(() => planDate = picked);
                      }),
                      const SizedBox(height: 6),
                      _PickerRow(icon: Icons.access_time, label: planStart == null ? "Start time" : planStart!.format(context), onTap: () async {
                        final picked = await showTimePicker(context: context, initialTime: TimeOfDay.now());
                        if (picked != null) setState(() => planStart = picked);
                      }),
                      const SizedBox(height: 6),
                      _PickerRow(icon: Icons.access_time_filled, label: planEnd == null ? "End time" : planEnd!.format(context), onTap: () async {
                        final picked = await showTimePicker(context: context, initialTime: TimeOfDay.now());
                        if (picked != null) setState(() => planEnd = picked);
                      }),
                      const SizedBox(height: 10),
                      _GreenButton(label: "Add Plan", onPressed: () {
                        if (planActivityController.text.isNotEmpty && planDate != null) {
                          setState(() {
                            plans.add({'friend': selectedFriend ?? '', 'activity': planActivityController.text.trim(), 'date': planDate!, 'start': planStart?.format(context) ?? '', 'end': planEnd?.format(context) ?? ''});
                            planActivityController.clear();
                          });
                          if (selectedFriend != null) gainFriendXp(selectedFriend!, 10);
                          gainXp(20);
                          _saveData();
                        }
                      }),
                    ]))),
                    const SizedBox(width: 12),
                    Expanded(child: _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text("💕 Relationships", style: GoogleFonts.cinzel(fontSize: 15, color: Colors.amber)),
                      const SizedBox(height: 10),
                      if (friends.isEmpty)
                        Text("No friends added yet", style: GoogleFonts.crimsonText(fontSize: 13, color: const Color(0xFFF5E8B0).withOpacity(0.5), fontStyle: FontStyle.italic))
                      else
                        ...friends.map((f) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(f['name'] as String, style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFFF5E8B0))),
                            const SizedBox(height: 2),
                            Text("Lv ${f['level']}  •  ${f['xp']} / ${f['maxXp']} XP", style: GoogleFonts.crimsonText(fontSize: 12, color: Colors.amber)),
                            const SizedBox(height: 4),
                            ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: (f['xp'] as int) / (f['maxXp'] as int), minHeight: 6, color: Colors.amber, backgroundColor: Colors.brown.shade800)),
                          ]),
                        )),
                    ]))),
                  ]),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _navButton(String emoji, String label, VoidCallback onPressed) =>
    ElevatedButton.icon(
      onPressed: onPressed,
      icon: Text(emoji, style: const TextStyle(fontSize: 16)),
      label: Text(label, style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, fontSize: 14)),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.black.withOpacity(0.55), foregroundColor: const Color(0xFFF5E8B0),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.3))),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      ),
    );

  String _fmtMins(int mins) {
    final h = mins ~/ 60;
    final m = mins % 60;
    return "${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}";
  }
}

// ── Reusable widgets ──────────────────────────────────────────────────────────

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity, padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.black.withOpacity(0.45), borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.15), width: 1),
      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 8)],
    ),
    child: child,
  );
}

class _GreenButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  const _GreenButton({required this.label, required this.onPressed});
  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), textStyle: GoogleFonts.cinzel(fontWeight: FontWeight.bold, fontSize: 13)),
      child: Text(label),
    ),
  );
}

class _DTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  const _DTextField({required this.controller, required this.hint});
  @override
  Widget build(BuildContext context) => TextField(
    controller: controller,
    style: GoogleFonts.crimsonText(fontSize: 14, color: const Color(0xFFF5E8B0)),
    decoration: InputDecoration(
      hintText: hint, hintStyle: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0).withOpacity(0.4)),
      filled: true, fillColor: Colors.white.withOpacity(0.07), isDense: true,
      contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFF5E8B0), width: 1.5)),
    ),
  );
}

class _PickerRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _PickerRow({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
      child: Row(children: [Icon(icon, size: 16, color: Colors.amber), const SizedBox(width: 8), Text(label, style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0)))]),
    ),
  );
}

// ── Calendar Screen ───────────────────────────────────────────────────────────

class CalendarScreen extends StatefulWidget {
  final List<Map<String, dynamic>> plans;
  final Map<String, int> intelligenceByDay;
  final Map<String, int> strengthByDay;
  final Map<String, Map<String, dynamic>> healthByDay;
  final List<Map<String, dynamic>> friends;
  final DateTime today;
  final Function(
    List<Map<String, dynamic>> plans,
    Map<String, int> intel,
    Map<String, int> strength,
    Map<String, Map<String, dynamic>> health,
  ) onDataChanged;

  const CalendarScreen({
    super.key,
    required this.plans,
    required this.intelligenceByDay,
    required this.strengthByDay,
    required this.healthByDay,
    required this.friends,
    required this.today,
    required this.onDataChanged,
  });

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _currentMonth = DateTime(DateTime.now().year, DateTime.now().month);
  DateTime? _selectedDay;

  late List<Map<String, dynamic>> _plans;
  late Map<String, int> _intel;
  late Map<String, int> _strength;
  late Map<String, Map<String, dynamic>> _health;

  @override
  void initState() {
    super.initState();
    _plans    = List.from(widget.plans);
    _intel    = Map.from(widget.intelligenceByDay);
    _strength = Map.from(widget.strengthByDay);
    _health   = Map.from(widget.healthByDay);
  }

  void _notifyParent() => widget.onDataChanged(_plans, _intel, _strength, _health);

  bool _isToday(DateTime date) =>
      date.year == widget.today.year && date.month == widget.today.month && date.day == widget.today.day;

  String _dk(DateTime d) => _dateKey(d);

  List<Map<String, dynamic>> _plansForDay(DateTime day) =>
      _plans.where((p) { final d = p['date'] as DateTime; return d.year == day.year && d.month == day.month && d.day == day.day; }).toList();

  List<Color> _dotsForDay(DateTime day) {
    final dots = <Color>[];
    final dk = _dk(day);
    if ((_intel[dk] ?? 0) > 0) dots.add(Colors.blue);
    if ((_strength[dk] ?? 0) > 0) dots.add(Colors.purple);
    final h = _health[dk];
    if (h != null && ((h['waterOz'] as int? ?? 0) > 0 || (h['calories'] as int? ?? 0) > 0 || (h['meals'] as List? ?? []).isNotEmpty)) dots.add(Colors.red);
    if (_plansForDay(day).isNotEmpty) dots.add(Colors.amber);
    return dots;
  }

  void _prevMonth() => setState(() { _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1); _selectedDay = null; });
  void _nextMonth() => setState(() { _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1); _selectedDay = null; });

  Widget _dot(Color color) => Container(width: 6, height: 6, margin: const EdgeInsets.symmetric(horizontal: 1), decoration: BoxDecoration(color: color, shape: BoxShape.circle));

  Widget _sectionHeader(String title, Color color, {VoidCallback? onEdit}) => Padding(
    padding: const EdgeInsets.only(bottom: 6, top: 14),
    child: Row(children: [
      Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
      const SizedBox(width: 8),
      Text(title, style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
      const Spacer(),
      if (onEdit != null)
        GestureDetector(onTap: onEdit, child: Icon(Icons.edit, size: 16, color: color.withOpacity(0.7))),
    ]),
  );

  Widget _infoCard(Widget child) => Container(
    margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Colors.black.withOpacity(0.45), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.15))),
    child: child,
  );

  String _fmtMins(int mins) {
    final h = mins ~/ 60; final m = mins % 60;
    return "${h.toString().padLeft(2,'0')}:${m.toString().padLeft(2,'0')}";
  }

  InputDecoration _inputDeco(String label) => InputDecoration(
    labelText: label, labelStyle: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6), fontSize: 12),
    filled: true, fillColor: Colors.white.withOpacity(0.07),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFF5E8B0), width: 1.5)),
  );

  // ── Edit dialogs ──────────────────────────────────────────────────────────

  void _editIntelligence(String dk) {
    final hoursCtrl = TextEditingController();
    final minsCtrl  = TextEditingController();
    showDialog(context: context, builder: (ctx) => AlertDialog(
      backgroundColor: const Color(0xFF1a1208),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text("✏️ Edit Intelligence", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 15, fontWeight: FontWeight.bold)),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        Text("Current: ${_fmtMins(_intel[dk] ?? 0)}", style: GoogleFonts.cinzel(color: Colors.amber, fontSize: 12)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: TextField(controller: hoursCtrl, keyboardType: TextInputType.number, maxLength: 2, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 22), textAlign: TextAlign.center, decoration: _inputDeco("HH").copyWith(counterText: ''))),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 8), child: Text(":", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 24))),
          Expanded(child: TextField(controller: minsCtrl, keyboardType: TextInputType.number, maxLength: 2, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 22), textAlign: TextAlign.center, decoration: _inputDeco("MM").copyWith(counterText: ''))),
        ]),
        const SizedBox(height: 8),
        TextButton(onPressed: () { setState(() => _intel.remove(dk)); _notifyParent(); Navigator.pop(ctx); },
          child: Text("Clear this day", style: GoogleFonts.cinzel(color: Colors.red.shade300, fontSize: 12))),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
          onPressed: () {
            final h = int.tryParse(hoursCtrl.text) ?? 0;
            final m = int.tryParse(minsCtrl.text) ?? 0;
            if (h > 0 || m > 0) {
              setState(() { final current = _intel[dk] ?? 0; int nv = current + h * 60 + m; if (nv >= 3600) nv = nv - 3600; _intel[dk] = nv; });
              _notifyParent();
            }
            Navigator.pop(ctx);
          },
          child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
        ),
      ],
    ));
  }

  void _editStrength(String dk) {
    final hoursCtrl = TextEditingController();
    final minsCtrl  = TextEditingController();
    showDialog(context: context, builder: (ctx) => AlertDialog(
      backgroundColor: const Color(0xFF1a1208),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text("✏️ Edit Strength", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 15, fontWeight: FontWeight.bold)),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        Text("Current: ${_fmtMins(_strength[dk] ?? 0)}", style: GoogleFonts.cinzel(color: Colors.amber, fontSize: 12)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: TextField(controller: hoursCtrl, keyboardType: TextInputType.number, maxLength: 2, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 22), textAlign: TextAlign.center, decoration: _inputDeco("HH").copyWith(counterText: ''))),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 8), child: Text(":", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 24))),
          Expanded(child: TextField(controller: minsCtrl, keyboardType: TextInputType.number, maxLength: 2, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 22), textAlign: TextAlign.center, decoration: _inputDeco("MM").copyWith(counterText: ''))),
        ]),
        const SizedBox(height: 8),
        TextButton(onPressed: () { setState(() => _strength.remove(dk)); _notifyParent(); Navigator.pop(ctx); },
          child: Text("Clear this day", style: GoogleFonts.cinzel(color: Colors.red.shade300, fontSize: 12))),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
          onPressed: () {
            final h = int.tryParse(hoursCtrl.text) ?? 0;
            final m = int.tryParse(minsCtrl.text) ?? 0;
            if (h > 0 || m > 0) {
              setState(() { final current = _strength[dk] ?? 0; int nv = current + h * 60 + m; if (nv >= 3600) nv = nv - 3600; _strength[dk] = nv; });
              _notifyParent();
            }
            Navigator.pop(ctx);
          },
          child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
        ),
      ],
    ));
  }

  void _editHealth(String dk) {
    final h = Map<String, dynamic>.from(_health[dk] ?? {'waterOz': 0, 'calories': 0, 'meals': <String>[], 'vitaminTaken': false});
    final waterCtrl = TextEditingController();
    final foodCtrl  = TextEditingController();
    final calCtrl   = TextEditingController();
    bool showCal    = false;
    showDialog(context: context, builder: (ctx) => StatefulBuilder(builder: (ctx, setDS) => AlertDialog(
      backgroundColor: const Color(0xFF1a1208),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text("✏️ Edit Health", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 15, fontWeight: FontWeight.bold)),
      content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Water
        Text("💧 Water: ${h['waterOz']} oz", style: GoogleFonts.cinzel(color: Colors.amber, fontSize: 12)),
        const SizedBox(height: 6),
        Row(children: [
          Expanded(child: TextField(controller: waterCtrl, keyboardType: TextInputType.number, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 16), decoration: _inputDeco("Add oz"))),
          const SizedBox(width: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () { final oz = int.tryParse(waterCtrl.text) ?? 0; if (oz > 0) { setDS(() { h['waterOz'] = (h['waterOz'] as int) + oz; waterCtrl.clear(); }); }},
            child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ]),
        const SizedBox(height: 12),
        // Meals
        Text("🍎 Meals:", style: GoogleFonts.cinzel(color: Colors.amber, fontSize: 12)),
        const SizedBox(height: 4),
        ...List<String>.from(h['meals'] ?? []).asMap().entries.map((e) => Row(children: [
          Expanded(child: Text("• ${e.value}", style: GoogleFonts.crimsonText(fontSize: 13, color: const Color(0xFFF5E8B0)))),
          IconButton(icon: Icon(Icons.delete, size: 16, color: Colors.red.shade300), onPressed: () {
            setDS(() { final ml = List<String>.from(h['meals']); ml.removeAt(e.key); h['meals'] = ml; });
          }),
        ])),
        Row(children: [
          Expanded(child: TextField(controller: foodCtrl, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 14), decoration: _inputDeco("Add food"))),
          const SizedBox(width: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () {
              if (foodCtrl.text.isNotEmpty) {
                final cal = int.tryParse(calCtrl.text) ?? 0;
                final entry = showCal && cal > 0 ? '${foodCtrl.text.trim()} ($cal cal)' : foodCtrl.text.trim();
                setDS(() { final ml = List<String>.from(h['meals']); ml.add(entry); h['meals'] = ml; h['calories'] = (h['calories'] as int) + cal; foodCtrl.clear(); calCtrl.clear(); });
              }
            },
            child: Text("Add", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ]),
        Row(children: [
          Checkbox(value: showCal, onChanged: (v) => setDS(() => showCal = v ?? false), activeColor: Colors.amber, checkColor: Colors.black, side: const BorderSide(color: Colors.amber)),
          Text("Add calories?", style: GoogleFonts.cinzel(fontSize: 11, color: const Color(0xFFF5E8B0))),
        ]),
        if (showCal) TextField(controller: calCtrl, keyboardType: TextInputType.number, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 14), decoration: _inputDeco("Calories")),
        const SizedBox(height: 8),
        TextButton(onPressed: () { setDS(() { h['waterOz'] = 0; h['calories'] = 0; h['meals'] = <String>[]; h['vitaminTaken'] = false; }); },
          child: Text("Clear all health for this day", style: GoogleFonts.cinzel(color: Colors.red.shade300, fontSize: 11))),
      ])),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Cancel", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
          onPressed: () { setState(() => _health[dk] = h); _notifyParent(); Navigator.pop(ctx); },
          child: Text("Save", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
        ),
      ],
    )));
  }

  void _editPlans(String dk, DateTime day) {
    final friendCtrl    = TextEditingController();
    final activityCtrl  = TextEditingController();
    String? selFriend   = widget.friends.isNotEmpty ? widget.friends.first['name'] as String : null;
    TimeOfDay? startT;
    TimeOfDay? endT;
    showDialog(context: context, builder: (ctx) => StatefulBuilder(builder: (ctx, setDS) {
      final dayPlans = _plans.where((p) { final d = p['date'] as DateTime; return d.year == day.year && d.month == day.month && d.day == day.day; }).toList();
      return AlertDialog(
        backgroundColor: const Color(0xFF1a1208),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text("✏️ Edit Plans", style: GoogleFonts.cinzelDecorative(color: const Color(0xFFF5E8B0), fontSize: 15, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Existing plans with delete
          if (dayPlans.isNotEmpty) ...[
            Text("Existing plans:", style: GoogleFonts.cinzel(color: Colors.amber, fontSize: 12)),
            const SizedBox(height: 4),
            ...dayPlans.map((p) => Row(children: [
              Expanded(child: Text("${p['friend']} — ${p['activity']}", style: GoogleFonts.crimsonText(fontSize: 12, color: const Color(0xFFF5E8B0)))),
              IconButton(icon: Icon(Icons.delete, size: 16, color: Colors.red.shade300), onPressed: () {
                setState(() => _plans.remove(p));
                setDS(() {});
                _notifyParent();
              }),
            ])),
            const Divider(color: Color(0xFFF5E8B0), height: 20),
          ],
          // Add new plan
          Text("Add new plan:", style: GoogleFonts.cinzel(color: Colors.amber, fontSize: 12)),
          const SizedBox(height: 8),
          if (widget.friends.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
              child: DropdownButton<String>(
                value: selFriend, isExpanded: true, underline: const SizedBox(), dropdownColor: const Color(0xFF1a1208),
                style: GoogleFonts.crimsonText(color: const Color(0xFFF5E8B0), fontSize: 14),
                items: widget.friends.map((f) => DropdownMenuItem(value: f['name'] as String, child: Text(f['name'] as String))).toList(),
                onChanged: (v) => setDS(() => selFriend = v),
              ),
            ),
          const SizedBox(height: 8),
          TextField(controller: activityCtrl, style: GoogleFonts.crimsonText(color: const Color(0xFFFFC200), fontSize: 14), decoration: _inputDeco("What are you doing?")),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () async { final t = await showTimePicker(context: context, initialTime: TimeOfDay.now()); if (t != null) setDS(() => startT = t); },
            child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10), decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
              child: Row(children: [const Icon(Icons.access_time, size: 16, color: Colors.amber), const SizedBox(width: 8), Text(startT == null ? "Start time" : startT!.format(context), style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0)))])),
          ),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: () async { final t = await showTimePicker(context: context, initialTime: TimeOfDay.now()); if (t != null) setDS(() => endT = t); },
            child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10), decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
              child: Row(children: [const Icon(Icons.access_time_filled, size: 16, color: Colors.amber), const SizedBox(width: 8), Text(endT == null ? "End time" : endT!.format(context), style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0)))])),
          ),
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text("Done", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.6)))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () {
              if (activityCtrl.text.isNotEmpty) {
                setState(() => _plans.add({'friend': selFriend ?? '', 'activity': activityCtrl.text.trim(), 'date': day, 'start': startT?.format(context) ?? '', 'end': endT?.format(context) ?? ''}));
                setDS(() {});
                _notifyParent();
              }
            },
            child: Text("Add Plan", style: GoogleFonts.cinzel(fontWeight: FontWeight.bold)),
          ),
        ],
      );
    }));
  }

  @override
  Widget build(BuildContext context) {
    final monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    final firstDay   = DateTime(_currentMonth.year, _currentMonth.month, 1);
    final daysInMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 0).day;
    final startWeekday = firstDay.weekday % 7;
    final selDay = _selectedDay;
    final selDk  = selDay != null ? _dk(selDay) : '';
    final selPlans = selDay != null ? _plansForDay(selDay) : <Map<String, dynamic>>[];
    final selIntel    = selDay != null ? (_intel[selDk] ?? 0) : 0;
    final selStrength = selDay != null ? (_strength[selDk] ?? 0) : 0;
    final selHealth   = selDay != null ? (_health[selDk] ?? <String, dynamic>{}) : <String, dynamic>{};

    return Scaffold(
      body: Stack(
        children: [
          SizedBox.expand(child: Image.asset('assets/dashboard.png', fit: BoxFit.cover)),
          SizedBox.expand(child: Container(color: Colors.black.withOpacity(0.55))),
          SafeArea(child: Column(children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(children: [
                IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: Color(0xFFF5E8B0))),
                const Spacer(),
                Text("${monthNames[_currentMonth.month - 1]} ${_currentMonth.year}", style: GoogleFonts.cinzelDecorative(fontSize: 20, color: const Color(0xFFF5E8B0), fontWeight: FontWeight.bold)),
                const Spacer(),
                IconButton(onPressed: _prevMonth, icon: const Icon(Icons.chevron_left, color: Color(0xFFF5E8B0), size: 28)),
                IconButton(onPressed: _nextMonth, icon: const Icon(Icons.chevron_right, color: Color(0xFFF5E8B0), size: 28)),
              ]),
            ),

            // Day headers
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(children: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) =>
                Expanded(child: Center(child: Text(d, style: GoogleFonts.cinzel(fontSize: 11, color: const Color(0xFFF5E8B0).withOpacity(0.6), fontWeight: FontWeight.bold))))).toList()),
            ),
            const SizedBox(height: 4),

            // Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: GridView.builder(
                shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7, childAspectRatio: 1),
                itemCount: startWeekday + daysInMonth,
                itemBuilder: (context, index) {
                  if (index < startWeekday) return const SizedBox();
                  final day     = index - startWeekday + 1;
                  final date    = DateTime(_currentMonth.year, _currentMonth.month, day);
                  final dots    = _dotsForDay(date);
                  final isToday = _isToday(date);
                  final isSel   = selDay != null && selDay.day == day && selDay.month == _currentMonth.month && selDay.year == _currentMonth.year;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDay = date),
                    child: Container(
                      margin: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: isToday ? Colors.amber.withOpacity(0.15) : isSel ? Colors.white.withOpacity(0.1) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: isSel ? Border.all(color: Colors.amber.withOpacity(0.6)) : isToday ? Border.all(color: Colors.amber.withOpacity(0.4)) : null,
                      ),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Text('$day', style: GoogleFonts.cinzel(fontSize: 13, color: isToday ? Colors.amber : const Color(0xFFF5E8B0), fontWeight: isToday || isSel ? FontWeight.bold : FontWeight.normal)),
                        if (dots.isNotEmpty) Row(mainAxisAlignment: MainAxisAlignment.center, children: dots.map(_dot).toList()),
                      ]),
                    ),
                  );
                },
              ),
            ),

            const Divider(color: Color(0xFFF5E8B0), height: 24, indent: 16, endIndent: 16),

            // Detail pane
            Expanded(
              child: selDay == null
                ? Center(child: Text("Tap a day to see details", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.5), fontSize: 14)))
                : ListView(padding: const EdgeInsets.symmetric(horizontal: 16), children: [
                    Text("${selDay.month.toString().padLeft(2,'0')}/${selDay.day.toString().padLeft(2,'0')}/${selDay.year}", style: GoogleFonts.cinzelDecorative(fontSize: 16, color: Colors.amber, fontWeight: FontWeight.bold)),

                    // Intelligence
                    if (selIntel > 0) ...[
                      _sectionHeader("🧠 Intelligence", Colors.blue, onEdit: () => _editIntelligence(selDk)),
                      _infoCard(Text("${_fmtMins(selIntel)} logged", style: GoogleFonts.crimsonText(fontSize: 14, color: const Color(0xFFF5E8B0)))),
                    ] else
                      _sectionHeader("🧠 Intelligence", Colors.blue.withOpacity(0.4), onEdit: () => _editIntelligence(selDk)),

                    // Strength
                    if (selStrength > 0) ...[
                      _sectionHeader("💪 Strength", Colors.purple, onEdit: () => _editStrength(selDk)),
                      _infoCard(Text("${_fmtMins(selStrength)} logged", style: GoogleFonts.crimsonText(fontSize: 14, color: const Color(0xFFF5E8B0)))),
                    ] else
                      _sectionHeader("💪 Strength", Colors.purple.withOpacity(0.4), onEdit: () => _editStrength(selDk)),

                    // Health
                    if (selHealth.isNotEmpty && ((selHealth['waterOz'] as int? ?? 0) > 0 || (selHealth['calories'] as int? ?? 0) > 0 || (selHealth['meals'] as List? ?? []).isNotEmpty)) ...[
                      _sectionHeader("🍎 Health", Colors.red, onEdit: () => _editHealth(selDk)),
                      if ((selHealth['waterOz'] as int? ?? 0) > 0)
                        _infoCard(Text("💧 ${selHealth['waterOz']} oz water", style: GoogleFonts.crimsonText(fontSize: 14, color: const Color(0xFFF5E8B0)))),
                      if ((selHealth['meals'] as List? ?? []).isNotEmpty)
                        _infoCard(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          ...List<String>.from(selHealth['meals']).map((m) => Text("• $m", style: GoogleFonts.crimsonText(fontSize: 13, color: const Color(0xFFF5E8B0)))),
                          if ((selHealth['calories'] as int? ?? 0) > 0)
                            Padding(padding: const EdgeInsets.only(top: 6), child: Text("Total: ${selHealth['calories']} cal", style: GoogleFonts.cinzel(fontSize: 12, color: Colors.amber))),
                        ])),
                    ] else
                      _sectionHeader("🍎 Health", Colors.red.withOpacity(0.4), onEdit: () => _editHealth(selDk)),

                    // Planner
                    if (selPlans.isNotEmpty) ...[
                      _sectionHeader("📅 Planner", Colors.amber, onEdit: () => _editPlans(selDk, selDay)),
                      ...selPlans.map((p) => _infoCard(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(p['friend'] as String, style: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFFF5E8B0))),
                        const SizedBox(height: 2),
                        Text(p['activity'] as String, style: GoogleFonts.crimsonText(fontSize: 14, color: const Color(0xFFF5E8B0))),
                        const SizedBox(height: 2),
                        Text("${p['start']} — ${p['end']}", style: GoogleFonts.cinzel(fontSize: 11, color: const Color(0xFFF5E8B0).withOpacity(0.6))),
                      ]))),
                    ] else
                      _sectionHeader("📅 Planner", Colors.amber.withOpacity(0.4), onEdit: () => _editPlans(selDk, selDay)),
                  ]),
            ),
          ])),
        ],
      ),
    );
  }
}
