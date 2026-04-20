import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  String? error;
  bool loading = false;

  void _login() async {
    setState(() {
      error = null;
      loading = true;
    });

    try {
      final result = await ApiService.login(
        emailController.text.trim(),
        passwordController.text,
      );
      if (result['id'] != null) {
        if (!mounted) return;
        Navigator.pushReplacementNamed(
          context,
          '/dashboard',
          arguments: result['username'],
        );
      } else {
        setState(() {
          error = result['error'] ?? 'Login failed';
        });
      }
    } catch (e) {
      setState(() {
        error = 'Network error or invalid credentials.';
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
          // Background — same as dashboard
          SizedBox.expand(
            child: Image.asset(
              'assets/dashboard.png',
              fit: BoxFit.cover,
            ),
          ),

          // Login card
          Center(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 400),
                margin: const EdgeInsets.symmetric(horizontal: 24),
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
                    // Title
                    Text(
                      "Welcome Back",
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
                      "Sign in to SkillTree",
                      style: GoogleFonts.cinzel(
                        fontSize: 13,
                        color: const Color(0xFFF5E8B0).withOpacity(0.6),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    // Email field
                    _Field(
                      controller: emailController,
                      label: "Email",
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),

                    // Password field
                    _Field(
                      controller: passwordController,
                      label: "Password",
                      isPassword: true,
                    ),

                    // Error message
                    if (error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          error!,
                          style: const TextStyle(
                            color: Color.fromARGB(255, 196, 55, 55),
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),

                    const SizedBox(height: 24),

                    // Login button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4CAF50),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          textStyle: GoogleFonts.cinzelDecorative(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        onPressed: loading ? null : _login,
                        child: loading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text("Login"),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Create Account + Forgot Password
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () {
                            Navigator.pushNamed(context, '/register');
                          },
                          child: Text(
                            "Create Account",
                            style: GoogleFonts.cinzel(
                              color: const Color(0xFFF5E8B0),
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.pushNamed(context, '/forgot-password');
                          },
                          child: Text(
                            "Forgot Password?",
                            style: GoogleFonts.cinzel(
                              color: const Color(0xFFF5E8B0).withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
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
          borderSide: BorderSide(
            color: const Color(0xFFF5E8B0).withOpacity(0.2),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: const Color(0xFFF5E8B0).withOpacity(0.2),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(
            color: Color(0xFFF5E8B0),
            width: 1.5,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      ),
    );
  }
}
