package javax.mail.internet;

import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.BASE64DecoderStream;
import com.sun.mail.util.BASE64EncoderStream;
import com.sun.mail.util.BEncoderStream;
import com.sun.mail.util.LineInputStream;
import com.sun.mail.util.QDecoderStream;
import com.sun.mail.util.QEncoderStream;
import com.sun.mail.util.QPDecoderStream;
import com.sun.mail.util.QPEncoderStream;
import com.sun.mail.util.UUDecoderStream;
import com.sun.mail.util.UUEncoderStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Hashtable;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.StringTokenizer;
import javax.mail.MessagingException;

public class MimeUtility
{
  public static final int ALL = -1;
  static final int ALL_ASCII = 1;
  static final int MOSTLY_ASCII = 2;
  static final int MOSTLY_NONASCII = 3;
  private static boolean decodeStrict = true;
  private static String defaultJavaCharset;
  private static String defaultMIMECharset;
  private static boolean encodeEolStrict = false;
  private static boolean foldEncodedWords = false;
  private static boolean foldText = true;
  private static Hashtable java2mime;
  private static Hashtable mime2java;

  // ERROR //
  static
  {
    // Byte code:
    //   0: iconst_1
    //   1: putstatic 32	javax/mail/internet/MimeUtility:decodeStrict	Z
    //   4: iconst_0
    //   5: putstatic 34	javax/mail/internet/MimeUtility:encodeEolStrict	Z
    //   8: iconst_0
    //   9: putstatic 36	javax/mail/internet/MimeUtility:foldEncodedWords	Z
    //   12: iconst_1
    //   13: putstatic 38	javax/mail/internet/MimeUtility:foldText	Z
    //   16: ldc 40
    //   18: invokestatic 46	java/lang/System:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   21: astore 53
    //   23: aload 53
    //   25: ifnull +709 -> 734
    //   28: aload 53
    //   30: ldc 48
    //   32: invokevirtual 54	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   35: ifeq +699 -> 734
    //   38: iconst_0
    //   39: istore 54
    //   41: iload 54
    //   43: putstatic 32	javax/mail/internet/MimeUtility:decodeStrict	Z
    //   46: ldc 56
    //   48: invokestatic 46	java/lang/System:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   51: astore 55
    //   53: aload 55
    //   55: ifnull +685 -> 740
    //   58: aload 55
    //   60: ldc 58
    //   62: invokevirtual 54	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   65: ifeq +675 -> 740
    //   68: iconst_1
    //   69: istore 56
    //   71: iload 56
    //   73: putstatic 34	javax/mail/internet/MimeUtility:encodeEolStrict	Z
    //   76: ldc 60
    //   78: invokestatic 46	java/lang/System:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   81: astore 57
    //   83: aload 57
    //   85: ifnull +661 -> 746
    //   88: aload 57
    //   90: ldc 58
    //   92: invokevirtual 54	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   95: ifeq +651 -> 746
    //   98: iconst_1
    //   99: istore 58
    //   101: iload 58
    //   103: putstatic 36	javax/mail/internet/MimeUtility:foldEncodedWords	Z
    //   106: ldc 62
    //   108: invokestatic 46	java/lang/System:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   111: astore 59
    //   113: aload 59
    //   115: ifnull +637 -> 752
    //   118: aload 59
    //   120: ldc 48
    //   122: invokevirtual 54	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   125: istore 60
    //   127: iconst_0
    //   128: istore 61
    //   130: iload 60
    //   132: ifeq +620 -> 752
    //   135: iload 61
    //   137: putstatic 38	javax/mail/internet/MimeUtility:foldText	Z
    //   140: new 64	java/util/Hashtable
    //   143: dup
    //   144: bipush 40
    //   146: invokespecial 68	java/util/Hashtable:<init>	(I)V
    //   149: putstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   152: new 64	java/util/Hashtable
    //   155: dup
    //   156: bipush 10
    //   158: invokespecial 68	java/util/Hashtable:<init>	(I)V
    //   161: putstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   164: ldc 2
    //   166: ldc 74
    //   168: invokevirtual 80	java/lang/Class:getResourceAsStream	(Ljava/lang/String;)Ljava/io/InputStream;
    //   171: astore 47
    //   173: aload 47
    //   175: astore 48
    //   177: aload 48
    //   179: ifnull +41 -> 220
    //   182: new 82	com/sun/mail/util/LineInputStream
    //   185: dup
    //   186: aload 48
    //   188: invokespecial 85	com/sun/mail/util/LineInputStream:<init>	(Ljava/io/InputStream;)V
    //   191: astore 49
    //   193: aload 49
    //   195: checkcast 82	com/sun/mail/util/LineInputStream
    //   198: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   201: invokestatic 89	javax/mail/internet/MimeUtility:loadMappings	(Lcom/sun/mail/util/LineInputStream;Ljava/util/Hashtable;)V
    //   204: aload 49
    //   206: checkcast 82	com/sun/mail/util/LineInputStream
    //   209: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   212: invokestatic 89	javax/mail/internet/MimeUtility:loadMappings	(Lcom/sun/mail/util/LineInputStream;Ljava/util/Hashtable;)V
    //   215: aload 49
    //   217: invokevirtual 94	java/io/InputStream:close	()V
    //   220: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   223: invokevirtual 98	java/util/Hashtable:isEmpty	()Z
    //   226: ifeq +388 -> 614
    //   229: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   232: ldc 100
    //   234: ldc 102
    //   236: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   239: pop
    //   240: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   243: ldc 108
    //   245: ldc 102
    //   247: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   250: pop
    //   251: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   254: ldc 110
    //   256: ldc 102
    //   258: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   261: pop
    //   262: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   265: ldc 112
    //   267: ldc 114
    //   269: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   272: pop
    //   273: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   276: ldc 116
    //   278: ldc 114
    //   280: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   283: pop
    //   284: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   287: ldc 118
    //   289: ldc 114
    //   291: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   294: pop
    //   295: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   298: ldc 120
    //   300: ldc 122
    //   302: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   305: pop
    //   306: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   309: ldc 124
    //   311: ldc 122
    //   313: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   316: pop
    //   317: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   320: ldc 126
    //   322: ldc 122
    //   324: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   327: pop
    //   328: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   331: ldc 128
    //   333: ldc 130
    //   335: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   338: pop
    //   339: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   342: ldc 132
    //   344: ldc 130
    //   346: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   349: pop
    //   350: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   353: ldc 134
    //   355: ldc 130
    //   357: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   360: pop
    //   361: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   364: ldc 136
    //   366: ldc 138
    //   368: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   371: pop
    //   372: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   375: ldc 140
    //   377: ldc 138
    //   379: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   382: pop
    //   383: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   386: ldc 142
    //   388: ldc 138
    //   390: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   393: pop
    //   394: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   397: ldc 144
    //   399: ldc 146
    //   401: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   404: pop
    //   405: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   408: ldc 148
    //   410: ldc 146
    //   412: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   415: pop
    //   416: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   419: ldc 150
    //   421: ldc 146
    //   423: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   426: pop
    //   427: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   430: ldc 152
    //   432: ldc 154
    //   434: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   437: pop
    //   438: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   441: ldc 156
    //   443: ldc 154
    //   445: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   448: pop
    //   449: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   452: ldc 158
    //   454: ldc 154
    //   456: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   459: pop
    //   460: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   463: ldc 160
    //   465: ldc 162
    //   467: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   470: pop
    //   471: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   474: ldc 164
    //   476: ldc 162
    //   478: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   481: pop
    //   482: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   485: ldc 166
    //   487: ldc 162
    //   489: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   492: pop
    //   493: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   496: ldc 168
    //   498: ldc 170
    //   500: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   503: pop
    //   504: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   507: ldc 172
    //   509: ldc 170
    //   511: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   514: pop
    //   515: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   518: ldc 174
    //   520: ldc 170
    //   522: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   525: pop
    //   526: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   529: ldc 176
    //   531: ldc 178
    //   533: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   536: pop
    //   537: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   540: ldc 180
    //   542: ldc 182
    //   544: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   547: pop
    //   548: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   551: ldc 184
    //   553: ldc 182
    //   555: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   558: pop
    //   559: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   562: ldc 186
    //   564: ldc 188
    //   566: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   569: pop
    //   570: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   573: ldc 190
    //   575: ldc 192
    //   577: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   580: pop
    //   581: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   584: ldc 194
    //   586: ldc 196
    //   588: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   591: pop
    //   592: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   595: ldc 198
    //   597: ldc 200
    //   599: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   602: pop
    //   603: getstatic 70	javax/mail/internet/MimeUtility:java2mime	Ljava/util/Hashtable;
    //   606: ldc 202
    //   608: ldc 204
    //   610: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   613: pop
    //   614: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   617: invokevirtual 98	java/util/Hashtable:isEmpty	()Z
    //   620: ifeq +113 -> 733
    //   623: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   626: ldc 206
    //   628: ldc 208
    //   630: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   633: pop
    //   634: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   637: ldc 210
    //   639: ldc 212
    //   641: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   644: pop
    //   645: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   648: ldc 214
    //   650: ldc 216
    //   652: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   655: pop
    //   656: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   659: ldc 218
    //   661: ldc 216
    //   663: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   666: pop
    //   667: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   670: ldc 220
    //   672: ldc 222
    //   674: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   677: pop
    //   678: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   681: ldc 224
    //   683: ldc 226
    //   685: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   688: pop
    //   689: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   692: ldc 204
    //   694: ldc 228
    //   696: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   699: pop
    //   700: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   703: ldc 230
    //   705: ldc 228
    //   707: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   710: pop
    //   711: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   714: ldc 232
    //   716: ldc 102
    //   718: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   721: pop
    //   722: getstatic 72	javax/mail/internet/MimeUtility:mime2java	Ljava/util/Hashtable;
    //   725: ldc 234
    //   727: ldc 102
    //   729: invokevirtual 106	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   732: pop
    //   733: return
    //   734: iconst_1
    //   735: istore 54
    //   737: goto -696 -> 41
    //   740: iconst_0
    //   741: istore 56
    //   743: goto -672 -> 71
    //   746: iconst_0
    //   747: istore 58
    //   749: goto -648 -> 101
    //   752: iconst_1
    //   753: istore 61
    //   755: goto -620 -> 135
    //   758: astore 50
    //   760: aload 48
    //   762: invokevirtual 94	java/io/InputStream:close	()V
    //   765: aload 50
    //   767: athrow
    //   768: astore_1
    //   769: goto -549 -> 220
    //   772: astore 51
    //   774: goto -9 -> 765
    //   777: astore 52
    //   779: goto -559 -> 220
    //   782: astore 50
    //   784: aload 49
    //   786: astore 48
    //   788: goto -28 -> 760
    //   791: astore_0
    //   792: goto -652 -> 140
    //
    // Exception table:
    //   from	to	target	type
    //   182	193	758	finally
    //   164	173	768	java/lang/Exception
    //   765	768	768	java/lang/Exception
    //   760	765	772	java/lang/Exception
    //   215	220	777	java/lang/Exception
    //   193	215	782	finally
    //   16	23	791	java/lang/SecurityException
    //   28	38	791	java/lang/SecurityException
    //   41	53	791	java/lang/SecurityException
    //   58	68	791	java/lang/SecurityException
    //   71	83	791	java/lang/SecurityException
    //   88	98	791	java/lang/SecurityException
    //   101	113	791	java/lang/SecurityException
    //   118	127	791	java/lang/SecurityException
    //   135	140	791	java/lang/SecurityException
  }

  static int checkAscii(InputStream paramInputStream, int paramInt, boolean paramBoolean)
  {
    int i = 4096;
    int j;
    byte[] arrayOfByte;
    int k;
    int m;
    int n;
    int i1;
    int i2;
    if ((encodeEolStrict) && (paramBoolean))
    {
      j = 1;
      arrayOfByte = (byte[])null;
      k = 0;
      m = 0;
      n = 0;
      i1 = 0;
      i2 = 0;
      if (paramInt != 0)
        if (paramInt != -1)
          break label76;
    }
    label60: label76: for (i = 4096; ; i = Math.min(paramInt, 4096))
    {
      arrayOfByte = new byte[i];
      if (paramInt != 0)
        break label87;
      if ((paramInt != 0) || (!paramBoolean))
        break label204;
      return 3;
      j = 0;
      break;
    }
    label256: label270: label273: 
    while (true)
    {
      label87: int i3;
      int i4;
      int i5;
      int i6;
      try
      {
        i3 = paramInputStream.read(arrayOfByte, 0, i);
        if (i3 == -1)
          break label60;
        i4 = 0;
        i5 = 0;
        break label236;
        i6 = 0xFF & arrayOfByte[i4];
        if (j == 0)
          break label273;
        if (i5 != 13)
          break label256;
        if (i6 != 10)
          break label270;
        break label256;
        boolean bool = nonascii(i6);
        if (bool)
        {
          if (paramBoolean)
          {
            return 3;
            n++;
            if (n <= 998)
              continue;
            i1 = 1;
            continue;
          }
          i2++;
          i5 = i6;
          i4++;
          break label236;
        }
        k++;
        continue;
      }
      catch (IOException localIOException)
      {
      }
      break label60;
      label204: if (i2 == 0)
      {
        if (m != 0)
          return 3;
        if (i1 != 0)
          return 2;
        return 1;
      }
      if (k > i2)
        return 2;
      return 3;
      label236: if (i4 >= i3)
      {
        if (paramInt == -1)
          break;
        paramInt -= i3;
        break;
        if ((i5 != 13) && (i6 == 10))
          m = 1;
        if ((i6 == 13) || (i6 == 10))
          n = 0;
      }
    }
  }

  static int checkAscii(String paramString)
  {
    int i = 0;
    int j = 0;
    int k = paramString.length();
    int m = 0;
    if (m >= k)
    {
      if (j == 0)
        return 1;
    }
    else
    {
      if (nonascii(paramString.charAt(m)))
        j++;
      while (true)
      {
        m++;
        break;
        i++;
      }
    }
    if (i > j)
      return 2;
    return 3;
  }

  static int checkAscii(byte[] paramArrayOfByte)
  {
    int i = 0;
    int j = 0;
    int k = 0;
    if (k >= paramArrayOfByte.length)
    {
      if (j == 0)
        return 1;
    }
    else
    {
      if (nonascii(0xFF & paramArrayOfByte[k]))
        j++;
      while (true)
      {
        k++;
        break;
        i++;
      }
    }
    if (i > j)
      return 2;
    return 3;
  }

  public static InputStream decode(InputStream paramInputStream, String paramString)
    throws MessagingException
  {
    if (paramString.equalsIgnoreCase("base64"))
      paramInputStream = new BASE64DecoderStream(paramInputStream);
    do
    {
      return paramInputStream;
      if (paramString.equalsIgnoreCase("quoted-printable"))
        return new QPDecoderStream(paramInputStream);
      if ((paramString.equalsIgnoreCase("uuencode")) || (paramString.equalsIgnoreCase("x-uuencode")) || (paramString.equalsIgnoreCase("x-uue")))
        return new UUDecoderStream(paramInputStream);
    }
    while ((paramString.equalsIgnoreCase("binary")) || (paramString.equalsIgnoreCase("7bit")) || (paramString.equalsIgnoreCase("8bit")));
    throw new MessagingException("Unknown encoding: " + paramString);
  }

  private static String decodeInnerWords(String paramString)
    throws UnsupportedEncodingException
  {
    int i = 0;
    StringBuffer localStringBuffer = new StringBuffer();
    while (true)
    {
      int j = paramString.indexOf("=?", i);
      if (j < 0);
      int n;
      Object localObject;
      while (i == 0)
      {
        return paramString;
        localStringBuffer.append(paramString.substring(i, j));
        int k = paramString.indexOf('?', j + 2);
        if (k >= 0)
        {
          int m = paramString.indexOf('?', k + 1);
          if (m >= 0)
          {
            n = paramString.indexOf("?=", m + 1);
            if (n >= 0)
              localObject = paramString.substring(j, n + 2);
          }
        }
      }
      try
      {
        String str = decodeWord((String)localObject);
        localObject = str;
        label113: localStringBuffer.append((String)localObject);
        i = n + 2;
        continue;
        if (i < paramString.length())
          localStringBuffer.append(paramString.substring(i));
        return localStringBuffer.toString();
      }
      catch (ParseException localParseException)
      {
        break label113;
      }
    }
  }

  public static String decodeText(String paramString)
    throws UnsupportedEncodingException
  {
    if (paramString.indexOf("=?") == -1)
      return paramString;
    StringTokenizer localStringTokenizer = new StringTokenizer(paramString, " \t\n\r", true);
    StringBuffer localStringBuffer1 = new StringBuffer();
    StringBuffer localStringBuffer2 = new StringBuffer();
    boolean bool = false;
    while (true)
    {
      if (!localStringTokenizer.hasMoreTokens())
      {
        localStringBuffer1.append(localStringBuffer2);
        return localStringBuffer1.toString();
      }
      String str1 = localStringTokenizer.nextToken();
      char c = str1.charAt(0);
      if ((c == ' ') || (c == '\t') || (c == '\r') || (c == '\n'))
      {
        localStringBuffer2.append(c);
        continue;
      }
      try
      {
        localObject = decodeWord(str1);
        if ((!bool) && (localStringBuffer2.length() > 0))
          localStringBuffer1.append(localStringBuffer2);
        bool = true;
        localStringBuffer1.append((String)localObject);
        localStringBuffer2.setLength(0);
      }
      catch (ParseException localParseException)
      {
        while (true)
        {
          Object localObject = str1;
          if (!decodeStrict)
          {
            String str2 = decodeInnerWords((String)localObject);
            if (str2 != localObject)
            {
              if (((!bool) || (!((String)localObject).startsWith("=?"))) && (localStringBuffer2.length() > 0))
                localStringBuffer1.append(localStringBuffer2);
              bool = ((String)localObject).endsWith("?=");
              localObject = str2;
            }
            else
            {
              if (localStringBuffer2.length() > 0)
                localStringBuffer1.append(localStringBuffer2);
              bool = false;
            }
          }
          else
          {
            if (localStringBuffer2.length() > 0)
              localStringBuffer1.append(localStringBuffer2);
            bool = false;
          }
        }
      }
    }
  }

  public static String decodeWord(String paramString)
    throws ParseException, UnsupportedEncodingException
  {
    if (!paramString.startsWith("=?"))
      throw new ParseException("encoded word does not start with \"=?\": " + paramString);
    int i = paramString.indexOf('?', 2);
    if (i == -1)
      throw new ParseException("encoded word does not include charset: " + paramString);
    String str1 = javaCharset(paramString.substring(2, i));
    int j = i + 1;
    int k = paramString.indexOf('?', j);
    if (k == -1)
      throw new ParseException("encoded word does not include encoding: " + paramString);
    String str2 = paramString.substring(j, k);
    int m = k + 1;
    int n = paramString.indexOf("?=", m);
    if (n == -1)
      throw new ParseException("encoded word does not end with \"?=\": " + paramString);
    String str3 = paramString.substring(m, n);
    String str4;
    try
    {
      if (str3.length() > 0)
      {
        ByteArrayInputStream localByteArrayInputStream = new ByteArrayInputStream(ASCIIUtility.getBytes(str3));
        if (str2.equalsIgnoreCase("B"));
        for (Object localObject = new BASE64DecoderStream(localByteArrayInputStream); ; localObject = new QDecoderStream(localByteArrayInputStream))
        {
          int i1 = localByteArrayInputStream.available();
          arrayOfByte = new byte[i1];
          i2 = ((InputStream)localObject).read(arrayOfByte, 0, i1);
          if (i2 > 0)
            break label384;
          str4 = "";
          if (n + 2 >= paramString.length())
            break label440;
          String str5 = paramString.substring(n + 2);
          if (!decodeStrict)
            str5 = decodeInnerWords(str5);
          return str4 + str5;
          if (!str2.equalsIgnoreCase("Q"))
            break;
        }
        throw new UnsupportedEncodingException("unknown encoding: " + str2);
      }
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException2)
    {
      while (true)
      {
        byte[] arrayOfByte;
        int i2;
        throw localUnsupportedEncodingException2;
        str4 = new String(arrayOfByte, 0, i2, str1);
      }
    }
    catch (IOException localIOException)
    {
      while (true)
      {
        throw new ParseException(localIOException.toString());
        str4 = "";
      }
    }
    catch (IllegalArgumentException localIllegalArgumentException)
    {
      label384: UnsupportedEncodingException localUnsupportedEncodingException1 = new UnsupportedEncodingException(str1);
      throw localUnsupportedEncodingException1;
    }
    label440: return str4;
  }

  private static void doEncode(String paramString1, boolean paramBoolean1, String paramString2, int paramInt, String paramString3, boolean paramBoolean2, boolean paramBoolean3, StringBuffer paramStringBuffer)
    throws UnsupportedEncodingException
  {
    byte[] arrayOfByte1 = paramString1.getBytes(paramString2);
    if (paramBoolean1);
    for (int i = BEncoderStream.encodedLength(arrayOfByte1); i > paramInt; i = QEncoderStream.encodedLength(arrayOfByte1, paramBoolean3))
    {
      int k = paramString1.length();
      if (k <= 1)
        break;
      doEncode(paramString1.substring(0, k / 2), paramBoolean1, paramString2, paramInt, paramString3, paramBoolean2, paramBoolean3, paramStringBuffer);
      doEncode(paramString1.substring(k / 2, k), paramBoolean1, paramString2, paramInt, paramString3, false, paramBoolean3, paramStringBuffer);
      return;
    }
    ByteArrayOutputStream localByteArrayOutputStream = new ByteArrayOutputStream();
    Object localObject;
    if (paramBoolean1)
      localObject = new BEncoderStream(localByteArrayOutputStream);
    try
    {
      ((OutputStream)localObject).write(arrayOfByte1);
      ((OutputStream)localObject).close();
      label131: byte[] arrayOfByte2 = localByteArrayOutputStream.toByteArray();
      if (!paramBoolean2)
      {
        if (foldEncodedWords)
          paramStringBuffer.append("\r\n ");
      }
      else
        label158: paramStringBuffer.append(paramString3);
      for (int j = 0; ; j++)
      {
        if (j >= arrayOfByte2.length)
        {
          paramStringBuffer.append("?=");
          return;
          localObject = new QEncoderStream(localByteArrayOutputStream, paramBoolean3);
          break;
          paramStringBuffer.append(" ");
          break label158;
        }
        paramStringBuffer.append((char)arrayOfByte2[j]);
      }
    }
    catch (IOException localIOException)
    {
      break label131;
    }
  }

  public static OutputStream encode(OutputStream paramOutputStream, String paramString)
    throws MessagingException
  {
    if (paramString == null);
    do
    {
      return paramOutputStream;
      if (paramString.equalsIgnoreCase("base64"))
        return new BASE64EncoderStream(paramOutputStream);
      if (paramString.equalsIgnoreCase("quoted-printable"))
        return new QPEncoderStream(paramOutputStream);
      if ((paramString.equalsIgnoreCase("uuencode")) || (paramString.equalsIgnoreCase("x-uuencode")) || (paramString.equalsIgnoreCase("x-uue")))
        return new UUEncoderStream(paramOutputStream);
    }
    while ((paramString.equalsIgnoreCase("binary")) || (paramString.equalsIgnoreCase("7bit")) || (paramString.equalsIgnoreCase("8bit")));
    throw new MessagingException("Unknown encoding: " + paramString);
  }

  public static OutputStream encode(OutputStream paramOutputStream, String paramString1, String paramString2)
    throws MessagingException
  {
    if (paramString1 == null);
    do
    {
      return paramOutputStream;
      if (paramString1.equalsIgnoreCase("base64"))
        return new BASE64EncoderStream(paramOutputStream);
      if (paramString1.equalsIgnoreCase("quoted-printable"))
        return new QPEncoderStream(paramOutputStream);
      if ((paramString1.equalsIgnoreCase("uuencode")) || (paramString1.equalsIgnoreCase("x-uuencode")) || (paramString1.equalsIgnoreCase("x-uue")))
        return new UUEncoderStream(paramOutputStream, paramString2);
    }
    while ((paramString1.equalsIgnoreCase("binary")) || (paramString1.equalsIgnoreCase("7bit")) || (paramString1.equalsIgnoreCase("8bit")));
    throw new MessagingException("Unknown encoding: " + paramString1);
  }

  public static String encodeText(String paramString)
    throws UnsupportedEncodingException
  {
    return encodeText(paramString, null, null);
  }

  public static String encodeText(String paramString1, String paramString2, String paramString3)
    throws UnsupportedEncodingException
  {
    return encodeWord(paramString1, paramString2, paramString3, false);
  }

  public static String encodeWord(String paramString)
    throws UnsupportedEncodingException
  {
    return encodeWord(paramString, null, null);
  }

  public static String encodeWord(String paramString1, String paramString2, String paramString3)
    throws UnsupportedEncodingException
  {
    return encodeWord(paramString1, paramString2, paramString3, true);
  }

  private static String encodeWord(String paramString1, String paramString2, String paramString3, boolean paramBoolean)
    throws UnsupportedEncodingException
  {
    int i = checkAscii(paramString1);
    if (i == 1)
      return paramString1;
    String str;
    if (paramString2 == null)
    {
      str = getDefaultJavaCharset();
      paramString2 = getDefaultMIMECharset();
      if (paramString3 == null)
      {
        if (i == 3)
          break label130;
        paramString3 = "Q";
      }
      label41: if (!paramString3.equalsIgnoreCase("B"))
        break label137;
    }
    for (boolean bool = true; ; bool = false)
    {
      StringBuffer localStringBuffer = new StringBuffer();
      doEncode(paramString1, bool, str, 68 - paramString2.length(), "=?" + paramString2 + "?" + paramString3 + "?", true, paramBoolean, localStringBuffer);
      return localStringBuffer.toString();
      str = javaCharset(paramString2);
      break;
      label130: paramString3 = "B";
      break label41;
      label137: if (!paramString3.equalsIgnoreCase("Q"))
        break label153;
    }
    label153: throw new UnsupportedEncodingException("Unknown transfer encoding: " + paramString3);
  }

  public static String fold(int paramInt, String paramString)
  {
    if (!foldText)
      return paramString;
    for (int i = -1 + paramString.length(); ; i--)
    {
      if (i < 0);
      int j;
      do
      {
        if (i != -1 + paramString.length())
          paramString = paramString.substring(0, i + 1);
        if (paramInt + paramString.length() > 76)
          break;
        return paramString;
        j = paramString.charAt(i);
      }
      while ((j != 32) && (j != 9) && (j != 13) && (j != 10));
    }
    StringBuffer localStringBuffer = new StringBuffer(4 + paramString.length());
    char c1 = '\000';
    while (true)
    {
      if (paramInt + paramString.length() <= 76)
      {
        localStringBuffer.append(paramString);
        return localStringBuffer.toString();
      }
      int k = -1;
      for (int m = 0; ; m++)
      {
        if (m >= paramString.length());
        while ((k != -1) && (paramInt + m > 76))
        {
          if (k != -1)
            break label229;
          localStringBuffer.append(paramString);
          paramString = "";
          break;
        }
        char c2 = paramString.charAt(m);
        if (((c2 == ' ') || (c2 == '\t')) && (c1 != ' ') && (c1 != '\t'))
          k = m;
        c1 = c2;
      }
      label229: localStringBuffer.append(paramString.substring(0, k));
      localStringBuffer.append("\r\n");
      c1 = paramString.charAt(k);
      localStringBuffer.append(c1);
      paramString = paramString.substring(k + 1);
      paramInt = 1;
    }
  }

  public static String getDefaultJavaCharset()
  {
    if (defaultJavaCharset == null);
    try
    {
      String str2 = System.getProperty("mail.mime.charset");
      str1 = str2;
      if ((str1 != null) && (str1.length() > 0))
      {
        defaultJavaCharset = javaCharset(str1);
        return defaultJavaCharset;
      }
      try
      {
        defaultJavaCharset = System.getProperty("file.encoding", "8859_1");
        return defaultJavaCharset;
      }
      catch (SecurityException localSecurityException2)
      {
        while (true)
        {
          defaultJavaCharset = new InputStreamReader(new InputStream()
          {
            public int read()
            {
              return 0;
            }
          }).getEncoding();
          if (defaultJavaCharset == null)
            defaultJavaCharset = "8859_1";
        }
      }
    }
    catch (SecurityException localSecurityException1)
    {
      while (true)
        String str1 = null;
    }
  }

  static String getDefaultMIMECharset()
  {
    if (defaultMIMECharset == null);
    try
    {
      defaultMIMECharset = System.getProperty("mail.mime.charset");
      label15: if (defaultMIMECharset == null)
        defaultMIMECharset = mimeCharset(getDefaultJavaCharset());
      return defaultMIMECharset;
    }
    catch (SecurityException localSecurityException)
    {
      break label15;
    }
  }

  // ERROR //
  public static String getEncoding(javax.activation.DataHandler paramDataHandler)
  {
    // Byte code:
    //   0: aload_0
    //   1: invokevirtual 534	javax/activation/DataHandler:getName	()Ljava/lang/String;
    //   4: ifnull +11 -> 15
    //   7: aload_0
    //   8: invokevirtual 538	javax/activation/DataHandler:getDataSource	()Ljavax/activation/DataSource;
    //   11: invokestatic 541	javax/mail/internet/MimeUtility:getEncoding	(Ljavax/activation/DataSource;)Ljava/lang/String;
    //   14: areturn
    //   15: new 543	javax/mail/internet/ContentType
    //   18: dup
    //   19: aload_0
    //   20: invokevirtual 546	javax/activation/DataHandler:getContentType	()Ljava/lang/String;
    //   23: invokespecial 547	javax/mail/internet/ContentType:<init>	(Ljava/lang/String;)V
    //   26: astore_1
    //   27: aload_1
    //   28: ldc_w 549
    //   31: invokevirtual 552	javax/mail/internet/ContentType:match	(Ljava/lang/String;)Z
    //   34: ifeq +76 -> 110
    //   37: new 554	javax/mail/internet/AsciiOutputStream
    //   40: dup
    //   41: iconst_0
    //   42: iconst_0
    //   43: invokespecial 557	javax/mail/internet/AsciiOutputStream:<init>	(ZZ)V
    //   46: astore_2
    //   47: aload_0
    //   48: aload_2
    //   49: invokevirtual 560	javax/activation/DataHandler:writeTo	(Ljava/io/OutputStream;)V
    //   52: aload_2
    //   53: invokevirtual 563	javax/mail/internet/AsciiOutputStream:getAscii	()I
    //   56: tableswitch	default:+24 -> 80, 1:+38->94, 2:+46->102
    //   81: aconst_null
    //   82: bipush 58
    //   84: iconst_1
    //   85: aload 4
    //   87: areturn
    //   88: astore 7
    //   90: ldc_w 272
    //   93: areturn
    //   94: ldc_w 293
    //   97: astore 4
    //   99: goto -14 -> 85
    //   102: ldc_w 277
    //   105: astore 4
    //   107: goto -22 -> 85
    //   110: new 554	javax/mail/internet/AsciiOutputStream
    //   113: dup
    //   114: iconst_1
    //   115: getstatic 34	javax/mail/internet/MimeUtility:encodeEolStrict	Z
    //   118: invokespecial 557	javax/mail/internet/AsciiOutputStream:<init>	(ZZ)V
    //   121: astore 5
    //   123: aload_0
    //   124: aload 5
    //   126: invokevirtual 560	javax/activation/DataHandler:writeTo	(Ljava/io/OutputStream;)V
    //   129: aload 5
    //   131: invokevirtual 563	javax/mail/internet/AsciiOutputStream:getAscii	()I
    //   134: iconst_1
    //   135: if_icmpne +11 -> 146
    //   138: ldc_w 293
    //   141: astore 4
    //   143: goto -58 -> 85
    //   146: ldc_w 272
    //   149: astore 4
    //   151: goto -66 -> 85
    //   154: astore_3
    //   155: goto -103 -> 52
    //   158: astore 6
    //   160: goto -31 -> 129
    //
    // Exception table:
    //   from	to	target	type
    //   15	27	88	java/lang/Exception
    //   47	52	154	java/io/IOException
    //   123	129	158	java/io/IOException
  }

  // ERROR //
  public static String getEncoding(javax.activation.DataSource paramDataSource)
  {
    // Byte code:
    //   0: new 543	javax/mail/internet/ContentType
    //   3: dup
    //   4: aload_0
    //   5: invokeinterface 566 1 0
    //   10: invokespecial 547	javax/mail/internet/ContentType:<init>	(Ljava/lang/String;)V
    //   13: astore_1
    //   14: aload_0
    //   15: invokeinterface 570 1 0
    //   20: astore_3
    //   21: aload_1
    //   22: ldc_w 549
    //   25: invokevirtual 552	javax/mail/internet/ContentType:match	(Ljava/lang/String;)Z
    //   28: ifeq +54 -> 82
    //   31: iconst_0
    //   32: istore 4
    //   34: aload_3
    //   35: iconst_m1
    //   36: iload 4
    //   38: invokestatic 572	javax/mail/internet/MimeUtility:checkAscii	(Ljava/io/InputStream;IZ)I
    //   41: tableswitch	default:+23 -> 64, 1:+47->88, 2:+55->96
    //   65: aconst_null
    //   66: bipush 58
    //   68: iconst_2
    //   69: aload_3
    //   70: invokevirtual 94	java/io/InputStream:close	()V
    //   73: aload 5
    //   75: areturn
    //   76: astore 7
    //   78: ldc_w 272
    //   81: areturn
    //   82: iconst_1
    //   83: istore 4
    //   85: goto -51 -> 34
    //   88: ldc_w 293
    //   91: astore 5
    //   93: goto -24 -> 69
    //   96: ldc_w 277
    //   99: astore 5
    //   101: goto -32 -> 69
    //   104: astore 6
    //   106: goto -33 -> 73
    //   109: astore_2
    //   110: goto -32 -> 78
    //
    // Exception table:
    //   from	to	target	type
    //   0	14	76	java/lang/Exception
    //   69	73	104	java/io/IOException
    //   14	21	109	java/lang/Exception
  }

  private static int indexOfAny(String paramString1, String paramString2)
  {
    return indexOfAny(paramString1, paramString2, 0);
  }

  private static int indexOfAny(String paramString1, String paramString2, int paramInt)
  {
    int j;
    while (true)
    {
      int i;
      try
      {
        i = paramString1.length();
        j = paramInt;
        break label38;
        int k = paramString2.indexOf(paramString1.charAt(j));
        if (k >= 0)
          break;
        j++;
      }
      catch (StringIndexOutOfBoundsException localStringIndexOutOfBoundsException)
      {
        return -1;
      }
      label38: if (j >= i)
        j = -1;
    }
    return j;
  }

  public static String javaCharset(String paramString)
  {
    if ((mime2java == null) || (paramString == null));
    String str;
    do
    {
      return paramString;
      str = (String)mime2java.get(paramString.toLowerCase(Locale.ENGLISH));
    }
    while (str == null);
    return str;
  }

  private static void loadMappings(LineInputStream paramLineInputStream, Hashtable paramHashtable)
  {
    while (true)
    {
      String str1;
      try
      {
        str1 = paramLineInputStream.readLine();
        if (str1 == null)
          return;
      }
      catch (IOException localIOException)
      {
        return;
      }
      if ((!str1.startsWith("--")) || (!str1.endsWith("--")))
        if ((str1.trim().length() != 0) && (!str1.startsWith("#")))
        {
          StringTokenizer localStringTokenizer = new StringTokenizer(str1, " \t");
          try
          {
            String str2 = localStringTokenizer.nextToken();
            String str3 = localStringTokenizer.nextToken();
            paramHashtable.put(str2.toLowerCase(Locale.ENGLISH), str3);
          }
          catch (NoSuchElementException localNoSuchElementException)
          {
          }
        }
    }
  }

  public static String mimeCharset(String paramString)
  {
    if ((java2mime == null) || (paramString == null));
    String str;
    do
    {
      return paramString;
      str = (String)java2mime.get(paramString.toLowerCase(Locale.ENGLISH));
    }
    while (str == null);
    return str;
  }

  static final boolean nonascii(int paramInt)
  {
    return (paramInt >= 127) || ((paramInt < 32) && (paramInt != 13) && (paramInt != 10) && (paramInt != 9));
  }

  public static String quote(String paramString1, String paramString2)
  {
    int i = paramString1.length();
    int j = 0;
    for (int k = 0; ; k++)
    {
      if (k >= i)
      {
        if (j != 0)
        {
          StringBuffer localStringBuffer2 = new StringBuffer(i + 2);
          localStringBuffer2.append('"').append(paramString1).append('"');
          paramString1 = localStringBuffer2.toString();
        }
        return paramString1;
      }
      int m = paramString1.charAt(k);
      if ((m == 34) || (m == 92) || (m == 13) || (m == 10))
      {
        StringBuffer localStringBuffer1 = new StringBuffer(i + 3);
        localStringBuffer1.append('"');
        localStringBuffer1.append(paramString1.substring(0, k));
        int n = 0;
        int i1 = k;
        if (i1 >= i)
        {
          localStringBuffer1.append('"');
          return localStringBuffer1.toString();
        }
        char c = paramString1.charAt(i1);
        if (((c != '"') && (c != '\\') && (c != '\r') && (c != '\n')) || ((c == '\n') && (n == 13)));
        while (true)
        {
          localStringBuffer1.append(c);
          n = c;
          i1++;
          break;
          localStringBuffer1.append('\\');
        }
      }
      if ((m < 32) || (m >= 127) || (paramString2.indexOf(m) >= 0))
        j = 1;
    }
  }

  public static String unfold(String paramString)
  {
    if (!foldText)
      return paramString;
    StringBuffer localStringBuffer = null;
    while (true)
    {
      int i = indexOfAny(paramString, "\r\n");
      if (i < 0)
      {
        if (localStringBuffer == null)
          break;
        localStringBuffer.append(paramString);
        return localStringBuffer.toString();
      }
      int j = paramString.length();
      int k = i + 1;
      if ((k < j) && (paramString.charAt(k - 1) == '\r') && (paramString.charAt(k) == '\n'))
        k++;
      if ((i == 0) || (paramString.charAt(i - 1) != '\\'))
      {
        if (k < j)
        {
          int m = paramString.charAt(k);
          if ((m == 32) || (m == 9))
            for (int n = k + 1; ; n++)
              if (n < j)
              {
                int i1 = paramString.charAt(n);
                if ((i1 == 32) || (i1 == 9));
              }
              else
              {
                if (localStringBuffer == null)
                  localStringBuffer = new StringBuffer(paramString.length());
                if (i != 0)
                {
                  localStringBuffer.append(paramString.substring(0, i));
                  localStringBuffer.append(' ');
                }
                paramString = paramString.substring(n);
                break;
              }
        }
        if (localStringBuffer == null)
          localStringBuffer = new StringBuffer(paramString.length());
        localStringBuffer.append(paramString.substring(0, k));
        paramString = paramString.substring(k);
      }
      else
      {
        if (localStringBuffer == null)
          localStringBuffer = new StringBuffer(paramString.length());
        localStringBuffer.append(paramString.substring(0, i - 1));
        localStringBuffer.append(paramString.substring(i, k));
        paramString = paramString.substring(k);
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MimeUtility
 * JD-Core Version:    0.6.2
 */