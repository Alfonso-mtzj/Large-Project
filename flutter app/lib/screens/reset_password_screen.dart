import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String? token; // If using deep links, pass the token param

  const ResetPasswordScreen({super.key, this.token});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();
  String? error;
  String? message;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox.expand(
            child: Image.asset(
              'assets/register_UI.png', // or a separate reset background
              fit: BoxFit.cover,
            ),
          ),
          Center(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 420),
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
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Reset Password",
                      style: GoogleFonts.cinzelDecorative(
                        fontSize: 26,
                        color: Color(0xFFF5E8B0),
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 28),
                    TextField(
                      controller: passwordController,
                      obscureText: true,
                      style: GoogleFonts.crimsonText(fontWeight: FontWeight.w600, fontSize: 18, color: Color(0xFFF0DFA0)),
                      decoration: InputDecoration(
                        labelText: "New Password",
                        labelStyle: GoogleFonts.cinzel(color: Colors.white),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.08),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: EdgeInsets.symmetric(vertical: 18, horizontal: 18),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: confirmController,
                      obscureText: true,
                      style: GoogleFonts.crimsonText(fontWeight: FontWeight.w600, fontSize: 18, color: Color(0xFFF0DFA0)),
                      decoration: InputDecoration(
                        labelText: "Confirm Password",
                        labelStyle: GoogleFonts.cinzel(color: Colors.white),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.08),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: EdgeInsets.symmetric(vertical: 18, horizontal: 18),
                      ),
                    ),
                    if (error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 20),
                        child: Text(error!, style: TextStyle(color: Colors.redAccent)),
                      ),
                    if (message != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 20),
                        child: Text(message!, style: TextStyle(color: Colors.greenAccent)),
                      ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4CAF50),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          textStyle: GoogleFonts.cinzelDecorative(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                        child: const Text("Reset Password"),
                        onPressed: () async {
                          // TODO: Actually implement API call!
                          if (passwordController.text != confirmController.text) {
                            setState(() => error = "Passwords do not match");
                            return;
                          }
                          if (passwordController.text.length < 6) {
                            setState(() => error = "Password must be at least 6 characters");
                            return;
                          }
                          setState(() {
                            message = "Password reset! You can now login.";
                            error = null;
                          });
                          // Optionally auto-navigate to login after a delay
                          await Future.delayed(Duration(seconds: 2));
                          Navigator.pushReplacementNamed(context, '/login');
                        },
                      ),
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