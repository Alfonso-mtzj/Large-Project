import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final nameController = TextEditingController();
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  String? error;
  String? success;
  bool loading = false;

  String? _validatePassword(String password) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!password.contains(RegExp(r'[A-Z]'))) return 'Password must contain at least 1 uppercase letter';
    if (!password.contains(RegExp(r'[0-9]'))) return 'Password must contain at least 1 number';
    if (!password.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>]'))) return 'Password must contain at least 1 special character';
    return null;
  }

  void _register() async {
    // Validate password before hitting the API
    final passwordError = _validatePassword(passwordController.text);
    if (passwordError != null) {
      setState(() => error = passwordError);
      return;
    }

    setState(() {
      error = null;
      success = null;
      loading = true;
    });

    try {
      final result = await ApiService.register(
        name: nameController.text.trim(),
        username: usernameController.text.trim(),
        email: emailController.text.trim(),
        password: passwordController.text,
      );
      if (result['message'] != null) {
        setState(() {
          success = result['message'];
        });
      } else {
        setState(() {
          error = result['error'] ?? 'Registration failed';
        });
      }
    } catch (e) {
      setState(() {
        error = 'Network error or invalid information.';
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox.expand(
            child: Image.asset('assets/dashboard.png', fit: BoxFit.cover),
          ),
          Center(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 400),
                margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.55),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: const Color(0xFFF5E8B0).withOpacity(0.2),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Join SkillTree",
                      style: GoogleFonts.cinzelDecorative(
                        fontSize: 26,
                        color: const Color(0xFFF5E8B0),
                        fontWeight: FontWeight.w900,
                        shadows: [
                          Shadow(
                            blurRadius: 8,
                            color: Colors.black.withOpacity(0.5),
                            offset: const Offset(2, 2),
                          ),
                        ],
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Create your account",
                      style: GoogleFonts.cinzel(
                        fontSize: 13,
                        color: const Color(0xFFF5E8B0).withOpacity(0.6),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 28),

                    _Field(controller: nameController, label: "Full Name", keyboardType: TextInputType.name),
                    const SizedBox(height: 14),
                    _Field(controller: usernameController, label: "Username"),
                    const SizedBox(height: 14),
                    _Field(controller: emailController, label: "Email", keyboardType: TextInputType.emailAddress),
                    const SizedBox(height: 14),
                    _Field(controller: passwordController, label: "Password", isPassword: true),

                    // Password requirements hint
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        "Min 8 chars • 1 uppercase • 1 number • 1 special character",
                        style: GoogleFonts.cinzel(
                          fontSize: 10,
                          color: const Color(0xFFF5E8B0).withOpacity(0.4),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),

                    if (error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(error!,
                            style: const TextStyle(color: Color(0xFF8B0000), fontSize: 13),
                            textAlign: TextAlign.center),
                      ),

                    if (success != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(success!,
                            style: const TextStyle(color: Colors.greenAccent, fontSize: 13),
                            textAlign: TextAlign.center),
                      ),

                    const SizedBox(height: 24),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4CAF50),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          textStyle: GoogleFonts.cinzelDecorative(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                        onPressed: loading ? null : _register,
                        child: loading
                            ? const SizedBox(width: 24, height: 24,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text("Register"),
                      ),
                    ),

                    const SizedBox(height: 12),

                    TextButton(
                      onPressed: () => Navigator.pushNamed(context, '/login'),
                      child: Text("Back to Login",
                          style: GoogleFonts.cinzel(
                              color: const Color(0xFFF5E8B0),
                              fontWeight: FontWeight.w700,
                              fontSize: 12)),
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

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final bool isPassword;
  final TextInputType keyboardType;

  const _Field({
    required this.controller,
    required this.label,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: isPassword,
      style: GoogleFonts.crimsonText(
        fontWeight: FontWeight.w600,
        fontSize: 18,
        color: const Color(0xFFFFC200),
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.cinzel(
          color: const Color(0xFFF5E8B0).withOpacity(0.7),
          fontSize: 13,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
        filled: true,
        fillColor: Colors.white.withOpacity(0.07),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFF5E8B0), width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      ),
    );
  }
}
