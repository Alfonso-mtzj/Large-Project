import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final emailController = TextEditingController();
  String? message;
  String? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox.expand(
            child: Image.asset(
              'assets/login_UI.png', // or a separate reset background
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
                      "Forgot Password",
                      style: GoogleFonts.cinzelDecorative(
                        fontSize: 26,
                        color: Color(0xFFF5E8B0),
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 28),
                    TextField(
                      controller: emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: GoogleFonts.crimsonText(fontWeight: FontWeight.w600, fontSize: 18, color: Color(0xFFF0DFA0)),
                      decoration: InputDecoration(
                        labelText: "Enter your email",
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
                    if (message != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 19),
                        child: Text(message!, style: TextStyle(color: Colors.greenAccent)),
                      ),
                    if (error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 18),
                        child: Text(error!, style: TextStyle(color: Colors.redAccent)),
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
                        child: const Text("Send Reset Link"),
                        onPressed: () async {
                          // TODO: Actually implement API call!
                          setState(() {
                            message = "If that email exists, a password reset link has been sent.";
                            error = null;
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/login');
                      },
                      child: Text(
                        "Back to Login",
                        style: GoogleFonts.cinzel(color: Color(0xFFF5E8B0)),
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