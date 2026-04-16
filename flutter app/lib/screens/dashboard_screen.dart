import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
 
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
 
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}
 
class _DashboardScreenState extends State<DashboardScreen> {
  int studyHours = 0;
  int activityMinutes = 0;
  int level = 1;
  int xp = 0;
  int maxXp = 100;
  String username = '';
 
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args != null) username = args as String;
  }
 
  void gainXp(int amount) {
    setState(() {
      xp += amount;
      while (xp >= maxXp) {
        level++;
        xp -= maxXp;
      }
    });
  }
 
  @override
  Widget build(BuildContext context) {
    final xpPercent = xp / maxXp * 100;
 
    return Scaffold(
      body: Stack(
        children: [
          // Background
          SizedBox.expand(
            child: Image.asset(
              'assets/dashboard.png',
              fit: BoxFit.cover,
            ),
          ),
          Center(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 520),
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.45),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.32),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Header
                    Text(
                      username.isNotEmpty ? '@$username' : 'Dashboard',
                      style: GoogleFonts.cinzelDecorative(
                        fontSize: 28,
                        color: const Color(0xFFF5E8B0),
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      "Level $level",
                      style: GoogleFonts.cinzel(
                        fontSize: 22,
                        color: Color(0xFFF5E8B0),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // XP Bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: xpPercent / 100.0,
                        minHeight: 18,
                        color: Colors.amber,
                        backgroundColor: Colors.brown.shade800,
                      ),
                    ),
                    const SizedBox(height: 34),
                    // Stats Grid
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _StatCard(
                          label: "🧠 Intelligence",
                          value: "$studyHours hrs",
                          onAdd: () {
                            setState(() {
                              studyHours++;
                            });
                            gainXp(10);
                          },
                        ),
                        _StatCard(
                          label: "💪 Strength",
                          value: "$activityMinutes min",
                          onAdd: () {
                            setState(() {
                              activityMinutes += 10;
                            });
                            gainXp(8);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
 
class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onAdd;
  const _StatCard({required this.label, required this.value, required this.onAdd});
 
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        color: Colors.white.withOpacity(0.18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 22),
          child: Column(
            children: [
              Text(label, style: GoogleFonts.cinzel(fontSize: 16, color: Colors.amber)),
              const SizedBox(height: 8),
              Text(value, style: GoogleFonts.crimsonText(fontWeight: FontWeight.bold, color: Color(0xFFF5E8B0), fontSize: 21)),
              const SizedBox(height: 14),
              ElevatedButton(
                onPressed: onAdd,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  textStyle: GoogleFonts.cinzel(fontWeight: FontWeight.bold),
                ),
                child: const Text("Add"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
