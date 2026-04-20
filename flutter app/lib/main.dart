import 'package:flutter/material.dart';
import 'package:app_links/app_links.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/reset_password_screen.dart';

void main() {
  runApp(const SkillTreeApp());
}

class SkillTreeApp extends StatefulWidget {
  const SkillTreeApp({super.key});

  @override
  State<SkillTreeApp> createState() => _SkillTreeAppState();
}

class _SkillTreeAppState extends State<SkillTreeApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();
  late final AppLinks _appLinks;

  @override
  void initState() {
    super.initState();
    _initDeepLinks();
  }

  void _initDeepLinks() async {
    _appLinks = AppLinks();

    // Handle deep link when app is already open
    _appLinks.uriLinkStream.listen((uri) {
      _handleDeepLink(uri);
    });

    // Handle deep link that launched the app
    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null) {
      _handleDeepLink(initialUri);
    }
  }

  void _handleDeepLink(Uri uri) {
    // Expected: skilltree://reset-password/TOKEN
    if (uri.scheme == 'skilltree' && uri.host == 'reset-password') {
      final token = uri.pathSegments.isNotEmpty ? uri.pathSegments.first : '';
      if (token.isNotEmpty) {
        _navigatorKey.currentState?.pushNamed(
          '/reset-password',
          arguments: token,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SkillTree',
      debugShowCheckedModeBanner: false,
      navigatorKey: _navigatorKey,
      theme: ThemeData(
        primarySwatch: Colors.green,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/reset-password': (context) => const ResetPasswordScreen(),
      },
      onUnknownRoute: (settings) => MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );
  }
}
