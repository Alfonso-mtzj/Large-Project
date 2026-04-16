import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String _baseUrl = 'http://lifexpskilltree.xyz/api';

  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final url = Uri.parse('$_baseUrl/login');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      print('=== LOGIN ===');
      print('Status: ${response.statusCode}');
      print('Body: ${response.body}');
      return jsonDecode(response.body);
    } catch (e) {
      print('=== LOGIN ERROR: $e ===');
      return {'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> register({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      // Split full name into first and last name
      final parts = name.trim().split(' ');
      final firstName = parts.first;
      final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : '';

      final url = Uri.parse('$_baseUrl/register');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'username': username,
          'email': email,
          'password': password,
          'password_confirmation': password,
        }),
      );
      print('=== REGISTER ===');
      print('Status: ${response.statusCode}');
      print('Body: ${response.body}');
      return jsonDecode(response.body);
    } catch (e) {
      print('=== REGISTER ERROR: $e ===');
      return {'error': e.toString()};
    }
  }
}
