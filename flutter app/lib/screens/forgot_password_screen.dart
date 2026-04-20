import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final emailController = TextEditingController();
  final tokenController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();

  String? message;
  String? error;
  bool loading = false;
  bool emailSent = false;

  String? _validatePassword(String password) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!password.contains(RegExp(r'[A-Z]'))) return 'Password must contain at least 1 uppercase letter';
    if (!password.contains(RegExp(r'[0-9]'))) return 'Password must contain at least 1 number';
    if (!password.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>]'))) return 'Password must contain at least 1 special character';
    return null;
  }

  void _sendResetLink() async {
    setState(() { message = null; error = null; loading = true; });
    try {
      final result = await ApiService.forgotPassword(emailController.text.trim());
      setState(() {
        message = result['message'] ?? 'If that email exists, a reset token has been sent.';
        error = null;
        emailSent = true;
      });
    } catch (e) {
      setState(() => error = 'Network error. Please try again.');
    } finally {
      setState(() => loading = false);
    }
  }

  void _resetPassword() async {
    if (tokenController.text.isEmpty) {
      setState(() => error = 'Please enter the token from your email');
      return;
    }
    final passwordError = _validatePassword(passwordController.text);
    if (passwordError != null) {
      setState(() => error = passwordError);
      return;
    }
    if (passwordController.text != confirmController.text) {
      setState(() => error = 'Passwords do not match');
      return;
    }

    setState(() { error = null; loading = true; });

    try {
      final result = await ApiService.resetPassword(
        token: tokenController.text.trim(),
        password: passwordController.text,
      );
      if (result['message'] != null) {
        setState(() {
          message = 'Password reset successfully! Redirecting to login...';
          error = null;
        });
        await Future.delayed(const Duration(seconds: 2));
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        setState(() => error = result['error'] ?? 'Invalid or expired token.');
      }
    } catch (e) {
      setState(() => error = 'Network error. Please try again.');
    } finally {
      setState(() => loading = false);
    }
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    bool isPassword = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: isPassword,
      style: GoogleFonts.crimsonText(fontWeight: FontWeight.w600, fontSize: 18, color: const Color(0xFFFFC200)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.7), fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1),
        filled: true,
        fillColor: Colors.white.withOpacity(0.07),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: const Color(0xFFF5E8B0).withOpacity(0.2))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFF5E8B0), width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox.expand(child: Image.asset('assets/dashboard.png', fit: BoxFit.cover)),
          Center(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 400),
                margin: const EdgeInsets.symmetric(horizontal: 24),
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.55),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFF5E8B0).withOpacity(0.2), width: 1),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 12)],
                ),
                child: emailSent ? _buildStep2() : _buildStep1(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text("Forgot Password", style: GoogleFonts.cinzelDecorative(fontSize: 24, color: const Color(0xFFF5E8B0), fontWeight: FontWeight.w900), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text("Enter your email and we'll send you a reset token", style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0).withOpacity(0.6)), textAlign: TextAlign.center),
        const SizedBox(height: 28),
        _buildField(controller: emailController, label: "Email", keyboardType: TextInputType.emailAddress),
        if (message != null)
          Padding(padding: const EdgeInsets.only(top: 14), child: Text(message!, style: const TextStyle(color: Colors.greenAccent, fontSize: 13), textAlign: TextAlign.center)),
        if (error != null)
          Padding(padding: const EdgeInsets.only(top: 14), child: Text(error!, style: const TextStyle(color: Color(0xFF8B0000), fontSize: 13), textAlign: TextAlign.center)),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: GoogleFonts.cinzelDecorative(fontWeight: FontWeight.bold, fontSize: 16)),
            onPressed: loading ? null : _sendResetLink,
            child: loading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text("Send Reset Token"),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/login'), child: Text("Back to Login", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0), fontWeight: FontWeight.w700, fontSize: 12))),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text("Reset Password", style: GoogleFonts.cinzelDecorative(fontSize: 24, color: const Color(0xFFF5E8B0), fontWeight: FontWeight.w900), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text("Check your email for the reset token and enter it below", style: GoogleFonts.cinzel(fontSize: 12, color: const Color(0xFFF5E8B0).withOpacity(0.6)), textAlign: TextAlign.center),
        const SizedBox(height: 24),
        _buildField(controller: tokenController, label: "Reset Token (from email)"),
        const SizedBox(height: 16),
        _buildField(controller: passwordController, label: "New Password", isPassword: true),
        const SizedBox(height: 16),
        _buildField(controller: confirmController, label: "Confirm Password", isPassword: true),

        // Password requirements hint
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text(
            "Min 8 chars • 1 uppercase • 1 number • 1 special character",
            style: GoogleFonts.cinzel(fontSize: 10, color: const Color(0xFFF5E8B0).withOpacity(0.4)),
            textAlign: TextAlign.center,
          ),
        ),

        if (message != null)
          Padding(padding: const EdgeInsets.only(top: 14), child: Text(message!, style: const TextStyle(color: Colors.greenAccent, fontSize: 13), textAlign: TextAlign.center)),
        if (error != null)
          Padding(padding: const EdgeInsets.only(top: 14), child: Text(error!, style: const TextStyle(color: Color(0xFF8B0000), fontSize: 13), textAlign: TextAlign.center)),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50), foregroundColor: Colors.white, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: GoogleFonts.cinzelDecorative(fontWeight: FontWeight.bold, fontSize: 16)),
            onPressed: loading ? null : _resetPassword,
            child: loading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text("Reset Password"),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() { emailSent = false; error = null; message = null; }),
          child: Text("← Back", style: GoogleFonts.cinzel(color: const Color(0xFFF5E8B0).withOpacity(0.7), fontSize: 12)),
        ),
      ],
    );
  }
}
