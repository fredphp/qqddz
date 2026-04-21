package javax.mail.internet;

import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.LineOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Vector;
import javax.activation.DataSource;
import javax.mail.BodyPart;
import javax.mail.MessageAware;
import javax.mail.MessageContext;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.MultipartDataSource;

public class MimeMultipart extends Multipart
{
  private static boolean bmparse;
  private static boolean ignoreMissingBoundaryParameter;
  private static boolean ignoreMissingEndBoundary = true;
  private boolean complete = true;
  protected DataSource ds = null;
  protected boolean parsed = true;
  private String preamble = null;

  static
  {
    ignoreMissingBoundaryParameter = true;
    bmparse = true;
    try
    {
      String str1 = System.getProperty("mail.mime.multipart.ignoremissingendboundary");
      boolean bool1;
      boolean bool2;
      label59: boolean bool4;
      if ((str1 != null) && (str1.equalsIgnoreCase("false")))
      {
        bool1 = false;
        ignoreMissingEndBoundary = bool1;
        String str2 = System.getProperty("mail.mime.multipart.ignoremissingboundaryparameter");
        if ((str2 == null) || (!str2.equalsIgnoreCase("false")))
          break label104;
        bool2 = false;
        ignoreMissingBoundaryParameter = bool2;
        String str3 = System.getProperty("mail.mime.multipart.bmparse");
        if (str3 == null)
          break label110;
        boolean bool3 = str3.equalsIgnoreCase("false");
        bool4 = false;
        if (!bool3)
          break label110;
      }
      while (true)
      {
        bmparse = bool4;
        return;
        bool1 = true;
        break;
        label104: bool2 = true;
        break label59;
        label110: bool4 = true;
      }
    }
    catch (SecurityException localSecurityException)
    {
    }
  }

  public MimeMultipart()
  {
    this("mixed");
  }

  public MimeMultipart(String paramString)
  {
    String str = UniqueValue.getUniqueBoundaryValue();
    ContentType localContentType = new ContentType("multipart", paramString, null);
    localContentType.setParameter("boundary", str);
    this.contentType = localContentType.toString();
  }

  public MimeMultipart(DataSource paramDataSource)
    throws MessagingException
  {
    if ((paramDataSource instanceof MessageAware))
      setParent(((MessageAware)paramDataSource).getMessageContext().getPart());
    if ((paramDataSource instanceof MultipartDataSource))
    {
      setMultipartDataSource((MultipartDataSource)paramDataSource);
      return;
    }
    this.parsed = false;
    this.ds = paramDataSource;
    this.contentType = paramDataSource.getContentType();
  }

  // ERROR //
  private void parsebm()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 56	javax/mail/internet/MimeMultipart:parsed	Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifeq +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: lconst_0
    //   15: lstore_3
    //   16: lconst_0
    //   17: lstore 5
    //   19: aload_0
    //   20: getfield 54	javax/mail/internet/MimeMultipart:ds	Ljavax/activation/DataSource;
    //   23: invokeinterface 124 1 0
    //   28: astore 9
    //   30: aload 9
    //   32: instanceof 126
    //   35: ifne +34 -> 69
    //   38: aload 9
    //   40: instanceof 128
    //   43: ifne +26 -> 69
    //   46: aload 9
    //   48: instanceof 130
    //   51: ifne +18 -> 69
    //   54: new 128	java/io/BufferedInputStream
    //   57: dup
    //   58: aload 9
    //   60: invokespecial 133	java/io/BufferedInputStream:<init>	(Ljava/io/InputStream;)V
    //   63: astore 63
    //   65: aload 63
    //   67: astore 9
    //   69: aload 9
    //   71: instanceof 130
    //   74: istore 10
    //   76: aconst_null
    //   77: astore 11
    //   79: iload 10
    //   81: ifeq +10 -> 91
    //   84: aload 9
    //   86: checkcast 130	javax/mail/internet/SharedInputStream
    //   89: astore 11
    //   91: new 68	javax/mail/internet/ContentType
    //   94: dup
    //   95: aload_0
    //   96: getfield 85	javax/mail/internet/MimeMultipart:contentType	Ljava/lang/String;
    //   99: invokespecial 134	javax/mail/internet/ContentType:<init>	(Ljava/lang/String;)V
    //   102: ldc 75
    //   104: invokevirtual 137	javax/mail/internet/ContentType:getParameter	(Ljava/lang/String;)Ljava/lang/String;
    //   107: astore 12
    //   109: aload 12
    //   111: ifnull +121 -> 232
    //   114: new 139	java/lang/StringBuilder
    //   117: dup
    //   118: ldc 141
    //   120: invokespecial 142	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   123: aload 12
    //   125: invokevirtual 146	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   128: invokevirtual 147	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   131: astore 13
    //   133: aload 13
    //   135: astore 14
    //   137: new 149	com/sun/mail/util/LineInputStream
    //   140: dup
    //   141: aload 9
    //   143: invokespecial 150	com/sun/mail/util/LineInputStream:<init>	(Ljava/io/InputStream;)V
    //   146: astore 15
    //   148: aconst_null
    //   149: astore 16
    //   151: aconst_null
    //   152: astore 17
    //   154: aload 15
    //   156: invokevirtual 153	com/sun/mail/util/LineInputStream:readLine	()Ljava/lang/String;
    //   159: astore 22
    //   161: aload 22
    //   163: ifnonnull +92 -> 255
    //   166: aload 22
    //   168: ifnonnull +244 -> 412
    //   171: new 88	javax/mail/MessagingException
    //   174: dup
    //   175: ldc 155
    //   177: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   180: athrow
    //   181: astore 20
    //   183: new 88	javax/mail/MessagingException
    //   186: dup
    //   187: ldc 158
    //   189: aload 20
    //   191: invokespecial 161	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   194: astore 21
    //   196: aload 21
    //   198: athrow
    //   199: astore 18
    //   201: aload 9
    //   203: invokevirtual 166	java/io/InputStream:close	()V
    //   206: aload 18
    //   208: athrow
    //   209: astore_1
    //   210: aload_0
    //   211: monitorexit
    //   212: aload_1
    //   213: athrow
    //   214: astore 7
    //   216: new 88	javax/mail/MessagingException
    //   219: dup
    //   220: ldc 168
    //   222: aload 7
    //   224: invokespecial 161	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   227: astore 8
    //   229: aload 8
    //   231: athrow
    //   232: getstatic 22	javax/mail/internet/MimeMultipart:ignoreMissingBoundaryParameter	Z
    //   235: istore 62
    //   237: aconst_null
    //   238: astore 14
    //   240: iload 62
    //   242: ifne -105 -> 137
    //   245: new 88	javax/mail/MessagingException
    //   248: dup
    //   249: ldc 170
    //   251: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   254: athrow
    //   255: iconst_m1
    //   256: aload 22
    //   258: invokevirtual 174	java/lang/String:length	()I
    //   261: iadd
    //   262: istore 23
    //   264: goto +1004 -> 1268
    //   267: iload 23
    //   269: iconst_1
    //   270: iadd
    //   271: istore 24
    //   273: aload 22
    //   275: iconst_0
    //   276: iload 24
    //   278: invokevirtual 178	java/lang/String:substring	(II)Ljava/lang/String;
    //   281: astore 22
    //   283: aload 14
    //   285: ifnull +110 -> 395
    //   288: aload 22
    //   290: aload 14
    //   292: invokevirtual 182	java/lang/String:equals	(Ljava/lang/Object;)Z
    //   295: ifne -129 -> 166
    //   298: aload 22
    //   300: invokevirtual 174	java/lang/String:length	()I
    //   303: istore 25
    //   305: iload 25
    //   307: ifle -153 -> 154
    //   310: aload 17
    //   312: ifnonnull +16 -> 328
    //   315: ldc 184
    //   317: ldc 186
    //   319: invokestatic 189	java/lang/System:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   322: astore 29
    //   324: aload 29
    //   326: astore 17
    //   328: aload 16
    //   330: ifnonnull +23 -> 353
    //   333: iconst_2
    //   334: aload 22
    //   336: invokevirtual 174	java/lang/String:length	()I
    //   339: iadd
    //   340: istore 27
    //   342: new 191	java/lang/StringBuffer
    //   345: dup
    //   346: iload 27
    //   348: invokespecial 194	java/lang/StringBuffer:<init>	(I)V
    //   351: astore 16
    //   353: aload 16
    //   355: aload 22
    //   357: invokevirtual 197	java/lang/StringBuffer:append	(Ljava/lang/String;)Ljava/lang/StringBuffer;
    //   360: aload 17
    //   362: invokevirtual 197	java/lang/StringBuffer:append	(Ljava/lang/String;)Ljava/lang/StringBuffer;
    //   365: pop
    //   366: goto -212 -> 154
    //   369: aload 22
    //   371: iload 23
    //   373: invokevirtual 201	java/lang/String:charAt	(I)C
    //   376: istore 61
    //   378: iload 61
    //   380: bipush 32
    //   382: if_icmpeq +894 -> 1276
    //   385: iload 61
    //   387: bipush 9
    //   389: if_icmpne -122 -> 267
    //   392: goto +884 -> 1276
    //   395: aload 22
    //   397: ldc 141
    //   399: invokevirtual 204	java/lang/String:startsWith	(Ljava/lang/String;)Z
    //   402: ifeq -104 -> 298
    //   405: aload 22
    //   407: astore 14
    //   409: goto -243 -> 166
    //   412: aload 16
    //   414: ifnull +12 -> 426
    //   417: aload_0
    //   418: aload 16
    //   420: invokevirtual 205	java/lang/StringBuffer:toString	()Ljava/lang/String;
    //   423: putfield 60	javax/mail/internet/MimeMultipart:preamble	Ljava/lang/String;
    //   426: aload 14
    //   428: invokestatic 211	com/sun/mail/util/ASCIIUtility:getBytes	(Ljava/lang/String;)[B
    //   431: astore 30
    //   433: aload 30
    //   435: arraylength
    //   436: istore 31
    //   438: sipush 256
    //   441: newarray int
    //   443: astore 32
    //   445: iconst_0
    //   446: istore 33
    //   448: iload 33
    //   450: iload 31
    //   452: if_icmplt +47 -> 499
    //   455: iload 31
    //   457: newarray int
    //   459: astore 34
    //   461: iload 31
    //   463: istore 35
    //   465: iload 35
    //   467: ifgt +824 -> 1291
    //   470: aload 34
    //   472: iload 31
    //   474: iconst_1
    //   475: isub
    //   476: iconst_1
    //   477: iastore
    //   478: iconst_0
    //   479: istore 36
    //   481: iload 36
    //   483: ifeq +78 -> 561
    //   486: aload 9
    //   488: invokevirtual 166	java/io/InputStream:close	()V
    //   491: aload_0
    //   492: iconst_1
    //   493: putfield 56	javax/mail/internet/MimeMultipart:parsed	Z
    //   496: goto -485 -> 11
    //   499: aload 32
    //   501: aload 30
    //   503: iload 33
    //   505: baload
    //   506: iload 33
    //   508: iconst_1
    //   509: iadd
    //   510: iastore
    //   511: iinc 33 1
    //   514: goto -66 -> 448
    //   517: aload 30
    //   519: iload 60
    //   521: baload
    //   522: aload 30
    //   524: iload 60
    //   526: iload 35
    //   528: isub
    //   529: baload
    //   530: if_icmpne +779 -> 1309
    //   533: aload 34
    //   535: iload 60
    //   537: iconst_1
    //   538: isub
    //   539: iload 35
    //   541: iastore
    //   542: iinc 60 255
    //   545: goto +752 -> 1297
    //   548: iinc 60 255
    //   551: aload 34
    //   553: iload 60
    //   555: iload 35
    //   557: iastore
    //   558: goto +746 -> 1304
    //   561: aload 11
    //   563: ifnull +63 -> 626
    //   566: aload 11
    //   568: invokeinterface 215 1 0
    //   573: lstore_3
    //   574: aload 15
    //   576: invokevirtual 153	com/sun/mail/util/LineInputStream:readLine	()Ljava/lang/String;
    //   579: astore 37
    //   581: aload 37
    //   583: ifnull +11 -> 594
    //   586: aload 37
    //   588: invokevirtual 174	java/lang/String:length	()I
    //   591: ifgt -17 -> 574
    //   594: aconst_null
    //   595: astore 38
    //   597: aload 37
    //   599: ifnonnull +35 -> 634
    //   602: getstatic 20	javax/mail/internet/MimeMultipart:ignoreMissingEndBoundary	Z
    //   605: ifne +13 -> 618
    //   608: new 88	javax/mail/MessagingException
    //   611: dup
    //   612: ldc 217
    //   614: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   617: athrow
    //   618: aload_0
    //   619: iconst_0
    //   620: putfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   623: goto -137 -> 486
    //   626: aload_0
    //   627: aload 9
    //   629: invokevirtual 221	javax/mail/internet/MimeMultipart:createInternetHeaders	(Ljava/io/InputStream;)Ljavax/mail/internet/InternetHeaders;
    //   632: astore 38
    //   634: aload 9
    //   636: invokevirtual 225	java/io/InputStream:markSupported	()Z
    //   639: ifne +13 -> 652
    //   642: new 88	javax/mail/MessagingException
    //   645: dup
    //   646: ldc 227
    //   648: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   651: athrow
    //   652: aload 11
    //   654: ifnonnull +85 -> 739
    //   657: new 229	java/io/ByteArrayOutputStream
    //   660: dup
    //   661: invokespecial 230	java/io/ByteArrayOutputStream:<init>	()V
    //   664: astore 40
    //   666: iload 31
    //   668: newarray byte
    //   670: astore 41
    //   672: iload 31
    //   674: newarray byte
    //   676: astore 42
    //   678: iconst_0
    //   679: istore 43
    //   681: iconst_1
    //   682: istore 44
    //   684: sipush 1000
    //   687: iload 31
    //   689: iconst_4
    //   690: iadd
    //   691: iadd
    //   692: istore 45
    //   694: aload 9
    //   696: iload 45
    //   698: invokevirtual 233	java/io/InputStream:mark	(I)V
    //   701: iconst_0
    //   702: istore 46
    //   704: aload 9
    //   706: aload 41
    //   708: iconst_0
    //   709: iload 31
    //   711: invokestatic 237	javax/mail/internet/MimeMultipart:readFully	(Ljava/io/InputStream;[BII)I
    //   714: istore 47
    //   716: iload 47
    //   718: iload 31
    //   720: if_icmpge +595 -> 1315
    //   723: getstatic 20	javax/mail/internet/MimeMultipart:ignoreMissingEndBoundary	Z
    //   726: ifne +28 -> 754
    //   729: new 88	javax/mail/MessagingException
    //   732: dup
    //   733: ldc 217
    //   735: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   738: athrow
    //   739: aload 11
    //   741: invokeinterface 215 1 0
    //   746: lstore 5
    //   748: aconst_null
    //   749: astore 40
    //   751: goto -85 -> 666
    //   754: aload 11
    //   756: ifnull +12 -> 768
    //   759: aload 11
    //   761: invokeinterface 215 1 0
    //   766: lstore 5
    //   768: aload_0
    //   769: iconst_0
    //   770: putfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   773: iconst_1
    //   774: istore 36
    //   776: aload 11
    //   778: ifnull +409 -> 1187
    //   781: aload_0
    //   782: aload 11
    //   784: lload_3
    //   785: lload 5
    //   787: invokeinterface 241 5 0
    //   792: invokevirtual 245	javax/mail/internet/MimeMultipart:createMimeBodyPart	(Ljava/io/InputStream;)Ljavax/mail/internet/MimeBodyPart;
    //   795: astore 48
    //   797: aload_0
    //   798: aload 48
    //   800: invokespecial 249	javax/mail/Multipart:addBodyPart	(Ljavax/mail/BodyPart;)V
    //   803: goto -322 -> 481
    //   806: iload 52
    //   808: ifge +206 -> 1014
    //   811: iconst_0
    //   812: istore 46
    //   814: iload 44
    //   816: ifne +513 -> 1329
    //   819: aload 42
    //   821: iload 43
    //   823: iconst_1
    //   824: isub
    //   825: baload
    //   826: istore 53
    //   828: iload 53
    //   830: bipush 13
    //   832: if_icmpeq +13 -> 845
    //   835: iconst_0
    //   836: istore 46
    //   838: iload 53
    //   840: bipush 10
    //   842: if_icmpne +487 -> 1329
    //   845: iconst_1
    //   846: istore 46
    //   848: iload 53
    //   850: bipush 10
    //   852: if_icmpne +477 -> 1329
    //   855: iload 43
    //   857: iconst_2
    //   858: if_icmplt +471 -> 1329
    //   861: aload 42
    //   863: iload 43
    //   865: iconst_2
    //   866: isub
    //   867: baload
    //   868: bipush 13
    //   870: if_icmpne +459 -> 1329
    //   873: iconst_2
    //   874: istore 46
    //   876: goto +453 -> 1329
    //   879: aload 11
    //   881: ifnull +20 -> 901
    //   884: aload 11
    //   886: invokeinterface 215 1 0
    //   891: iload 31
    //   893: i2l
    //   894: lsub
    //   895: iload 46
    //   897: i2l
    //   898: lsub
    //   899: lstore 5
    //   901: aload 9
    //   903: invokevirtual 252	java/io/InputStream:read	()I
    //   906: istore 54
    //   908: iload 54
    //   910: bipush 45
    //   912: if_icmpne +50 -> 962
    //   915: aload 9
    //   917: invokevirtual 252	java/io/InputStream:read	()I
    //   920: bipush 45
    //   922: if_icmpne +40 -> 962
    //   925: aload_0
    //   926: iconst_1
    //   927: putfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   930: iconst_1
    //   931: istore 36
    //   933: goto -157 -> 776
    //   936: aload 41
    //   938: iload 52
    //   940: baload
    //   941: aload 30
    //   943: iload 52
    //   945: baload
    //   946: if_icmpne -140 -> 806
    //   949: iinc 52 255
    //   952: goto +369 -> 1321
    //   955: aload 9
    //   957: invokevirtual 252	java/io/InputStream:read	()I
    //   960: istore 54
    //   962: iload 54
    //   964: bipush 32
    //   966: if_icmpeq -11 -> 955
    //   969: iload 54
    //   971: bipush 9
    //   973: if_icmpeq -18 -> 955
    //   976: iload 54
    //   978: bipush 10
    //   980: if_icmpeq -204 -> 776
    //   983: iload 54
    //   985: bipush 13
    //   987: if_icmpne +355 -> 1342
    //   990: aload 9
    //   992: iconst_1
    //   993: invokevirtual 233	java/io/InputStream:mark	(I)V
    //   996: aload 9
    //   998: invokevirtual 252	java/io/InputStream:read	()I
    //   1001: bipush 10
    //   1003: if_icmpeq -227 -> 776
    //   1006: aload 9
    //   1008: invokevirtual 255	java/io/InputStream:reset	()V
    //   1011: goto -235 -> 776
    //   1014: iload 52
    //   1016: iconst_1
    //   1017: iadd
    //   1018: aload 32
    //   1020: bipush 127
    //   1022: aload 41
    //   1024: iload 52
    //   1026: baload
    //   1027: iand
    //   1028: iaload
    //   1029: isub
    //   1030: aload 34
    //   1032: iload 52
    //   1034: iaload
    //   1035: invokestatic 261	java/lang/Math:max	(II)I
    //   1038: istore 55
    //   1040: iload 55
    //   1042: iconst_2
    //   1043: if_icmpge +87 -> 1130
    //   1046: aload 11
    //   1048: ifnonnull +25 -> 1073
    //   1051: iload 43
    //   1053: iconst_1
    //   1054: if_icmple +19 -> 1073
    //   1057: iload 43
    //   1059: iconst_1
    //   1060: isub
    //   1061: istore 59
    //   1063: aload 40
    //   1065: aload 42
    //   1067: iconst_0
    //   1068: iload 59
    //   1070: invokevirtual 265	java/io/ByteArrayOutputStream:write	([BII)V
    //   1073: aload 9
    //   1075: invokevirtual 255	java/io/InputStream:reset	()V
    //   1078: aload_0
    //   1079: aload 9
    //   1081: lconst_1
    //   1082: invokespecial 269	javax/mail/internet/MimeMultipart:skipFully	(Ljava/io/InputStream;J)V
    //   1085: iload 43
    //   1087: iconst_1
    //   1088: if_icmplt +28 -> 1116
    //   1091: aload 42
    //   1093: iconst_0
    //   1094: aload 42
    //   1096: iload 43
    //   1098: iconst_1
    //   1099: isub
    //   1100: baload
    //   1101: bastore
    //   1102: aload 42
    //   1104: iconst_1
    //   1105: aload 41
    //   1107: iconst_0
    //   1108: baload
    //   1109: bastore
    //   1110: iconst_2
    //   1111: istore 43
    //   1113: goto +235 -> 1348
    //   1116: aload 42
    //   1118: iconst_0
    //   1119: aload 41
    //   1121: iconst_0
    //   1122: baload
    //   1123: bastore
    //   1124: iconst_1
    //   1125: istore 43
    //   1127: goto +221 -> 1348
    //   1130: iload 43
    //   1132: ifle +18 -> 1150
    //   1135: aload 11
    //   1137: ifnonnull +13 -> 1150
    //   1140: aload 40
    //   1142: aload 42
    //   1144: iconst_0
    //   1145: iload 43
    //   1147: invokevirtual 265	java/io/ByteArrayOutputStream:write	([BII)V
    //   1150: iload 55
    //   1152: istore 43
    //   1154: aload 9
    //   1156: invokevirtual 255	java/io/InputStream:reset	()V
    //   1159: iload 43
    //   1161: i2l
    //   1162: lstore 56
    //   1164: aload_0
    //   1165: aload 9
    //   1167: lload 56
    //   1169: invokespecial 269	javax/mail/internet/MimeMultipart:skipFully	(Ljava/io/InputStream;J)V
    //   1172: aload 41
    //   1174: astore 58
    //   1176: aload 42
    //   1178: astore 41
    //   1180: aload 58
    //   1182: astore 42
    //   1184: goto +164 -> 1348
    //   1187: iload 43
    //   1189: iload 46
    //   1191: isub
    //   1192: ifle +20 -> 1212
    //   1195: iload 43
    //   1197: iload 46
    //   1199: isub
    //   1200: istore 51
    //   1202: aload 40
    //   1204: aload 42
    //   1206: iconst_0
    //   1207: iload 51
    //   1209: invokevirtual 265	java/io/ByteArrayOutputStream:write	([BII)V
    //   1212: aload_0
    //   1213: getfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   1216: ifne +18 -> 1234
    //   1219: iload 47
    //   1221: ifle +13 -> 1234
    //   1224: aload 40
    //   1226: aload 41
    //   1228: iconst_0
    //   1229: iload 47
    //   1231: invokevirtual 265	java/io/ByteArrayOutputStream:write	([BII)V
    //   1234: aload 40
    //   1236: invokevirtual 273	java/io/ByteArrayOutputStream:toByteArray	()[B
    //   1239: astore 49
    //   1241: aload_0
    //   1242: aload 38
    //   1244: aload 49
    //   1246: invokevirtual 276	javax/mail/internet/MimeMultipart:createMimeBodyPart	(Ljavax/mail/internet/InternetHeaders;[B)Ljavax/mail/internet/MimeBodyPart;
    //   1249: astore 50
    //   1251: aload 50
    //   1253: astore 48
    //   1255: goto -458 -> 797
    //   1258: astore 19
    //   1260: goto -1054 -> 206
    //   1263: astore 39
    //   1265: goto -774 -> 491
    //   1268: iload 23
    //   1270: ifge -901 -> 369
    //   1273: goto -1006 -> 267
    //   1276: iinc 23 255
    //   1279: goto -11 -> 1268
    //   1282: astore 28
    //   1284: ldc 186
    //   1286: astore 17
    //   1288: goto -960 -> 328
    //   1291: iload 31
    //   1293: iconst_1
    //   1294: isub
    //   1295: istore 60
    //   1297: iload 60
    //   1299: iload 35
    //   1301: if_icmpge -784 -> 517
    //   1304: iload 60
    //   1306: ifgt -758 -> 548
    //   1309: iinc 35 255
    //   1312: goto -847 -> 465
    //   1315: iload 31
    //   1317: iconst_1
    //   1318: isub
    //   1319: istore 52
    //   1321: iload 52
    //   1323: ifge -387 -> 936
    //   1326: goto -520 -> 806
    //   1329: iload 44
    //   1331: ifne -452 -> 879
    //   1334: iload 46
    //   1336: ifle +6 -> 1342
    //   1339: goto -460 -> 879
    //   1342: iconst_0
    //   1343: istore 52
    //   1345: goto -331 -> 1014
    //   1348: iconst_0
    //   1349: istore 44
    //   1351: goto -667 -> 684
    //
    // Exception table:
    //   from	to	target	type
    //   137	148	181	java/io/IOException
    //   154	161	181	java/io/IOException
    //   171	181	181	java/io/IOException
    //   255	264	181	java/io/IOException
    //   273	283	181	java/io/IOException
    //   288	298	181	java/io/IOException
    //   298	305	181	java/io/IOException
    //   315	324	181	java/io/IOException
    //   333	353	181	java/io/IOException
    //   353	366	181	java/io/IOException
    //   369	378	181	java/io/IOException
    //   395	405	181	java/io/IOException
    //   417	426	181	java/io/IOException
    //   426	445	181	java/io/IOException
    //   455	461	181	java/io/IOException
    //   470	478	181	java/io/IOException
    //   499	511	181	java/io/IOException
    //   517	542	181	java/io/IOException
    //   551	558	181	java/io/IOException
    //   566	574	181	java/io/IOException
    //   574	581	181	java/io/IOException
    //   586	594	181	java/io/IOException
    //   602	618	181	java/io/IOException
    //   618	623	181	java/io/IOException
    //   626	634	181	java/io/IOException
    //   634	652	181	java/io/IOException
    //   657	666	181	java/io/IOException
    //   666	678	181	java/io/IOException
    //   694	701	181	java/io/IOException
    //   704	716	181	java/io/IOException
    //   723	739	181	java/io/IOException
    //   739	748	181	java/io/IOException
    //   759	768	181	java/io/IOException
    //   768	773	181	java/io/IOException
    //   781	797	181	java/io/IOException
    //   797	803	181	java/io/IOException
    //   819	828	181	java/io/IOException
    //   861	873	181	java/io/IOException
    //   884	901	181	java/io/IOException
    //   901	908	181	java/io/IOException
    //   915	930	181	java/io/IOException
    //   936	949	181	java/io/IOException
    //   955	962	181	java/io/IOException
    //   990	1011	181	java/io/IOException
    //   1014	1040	181	java/io/IOException
    //   1063	1073	181	java/io/IOException
    //   1073	1085	181	java/io/IOException
    //   1091	1110	181	java/io/IOException
    //   1116	1124	181	java/io/IOException
    //   1140	1150	181	java/io/IOException
    //   1154	1159	181	java/io/IOException
    //   1164	1172	181	java/io/IOException
    //   1202	1212	181	java/io/IOException
    //   1212	1219	181	java/io/IOException
    //   1224	1234	181	java/io/IOException
    //   1234	1251	181	java/io/IOException
    //   137	148	199	finally
    //   154	161	199	finally
    //   171	181	199	finally
    //   183	199	199	finally
    //   255	264	199	finally
    //   273	283	199	finally
    //   288	298	199	finally
    //   298	305	199	finally
    //   315	324	199	finally
    //   333	353	199	finally
    //   353	366	199	finally
    //   369	378	199	finally
    //   395	405	199	finally
    //   417	426	199	finally
    //   426	445	199	finally
    //   455	461	199	finally
    //   470	478	199	finally
    //   499	511	199	finally
    //   517	542	199	finally
    //   551	558	199	finally
    //   566	574	199	finally
    //   574	581	199	finally
    //   586	594	199	finally
    //   602	618	199	finally
    //   618	623	199	finally
    //   626	634	199	finally
    //   634	652	199	finally
    //   657	666	199	finally
    //   666	678	199	finally
    //   694	701	199	finally
    //   704	716	199	finally
    //   723	739	199	finally
    //   739	748	199	finally
    //   759	768	199	finally
    //   768	773	199	finally
    //   781	797	199	finally
    //   797	803	199	finally
    //   819	828	199	finally
    //   861	873	199	finally
    //   884	901	199	finally
    //   901	908	199	finally
    //   915	930	199	finally
    //   936	949	199	finally
    //   955	962	199	finally
    //   990	1011	199	finally
    //   1014	1040	199	finally
    //   1063	1073	199	finally
    //   1073	1085	199	finally
    //   1091	1110	199	finally
    //   1116	1124	199	finally
    //   1140	1150	199	finally
    //   1154	1159	199	finally
    //   1164	1172	199	finally
    //   1202	1212	199	finally
    //   1212	1219	199	finally
    //   1224	1234	199	finally
    //   1234	1251	199	finally
    //   2	7	209	finally
    //   19	65	209	finally
    //   69	76	209	finally
    //   84	91	209	finally
    //   91	109	209	finally
    //   114	133	209	finally
    //   201	206	209	finally
    //   206	209	209	finally
    //   216	232	209	finally
    //   232	237	209	finally
    //   245	255	209	finally
    //   486	491	209	finally
    //   491	496	209	finally
    //   19	65	214	java/lang/Exception
    //   201	206	1258	java/io/IOException
    //   486	491	1263	java/io/IOException
    //   315	324	1282	java/lang/SecurityException
  }

  private static int readFully(InputStream paramInputStream, byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i;
    if (paramInt2 == 0)
    {
      i = 0;
      break label17;
      label7: return i;
    }
    else
    {
      i = 0;
    }
    while (true)
    {
      if (paramInt2 <= 0)
      {
        label17: if (i > 0)
          break label7;
        return -1;
      }
      int j = paramInputStream.read(paramArrayOfByte, paramInt1, paramInt2);
      if (j <= 0)
        break;
      paramInt1 += j;
      i += j;
      paramInt2 -= j;
    }
  }

  private void skipFully(InputStream paramInputStream, long paramLong)
    throws IOException
  {
    while (true)
    {
      if (paramLong <= 0L)
        return;
      long l = paramInputStream.skip(paramLong);
      if (l <= 0L)
        throw new EOFException("can't skip");
      paramLong -= l;
    }
  }

  public void addBodyPart(BodyPart paramBodyPart)
    throws MessagingException
  {
    try
    {
      parse();
      super.addBodyPart(paramBodyPart);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void addBodyPart(BodyPart paramBodyPart, int paramInt)
    throws MessagingException
  {
    try
    {
      parse();
      super.addBodyPart(paramBodyPart, paramInt);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected InternetHeaders createInternetHeaders(InputStream paramInputStream)
    throws MessagingException
  {
    return new InternetHeaders(paramInputStream);
  }

  protected MimeBodyPart createMimeBodyPart(InputStream paramInputStream)
    throws MessagingException
  {
    return new MimeBodyPart(paramInputStream);
  }

  protected MimeBodyPart createMimeBodyPart(InternetHeaders paramInternetHeaders, byte[] paramArrayOfByte)
    throws MessagingException
  {
    return new MimeBodyPart(paramInternetHeaders, paramArrayOfByte);
  }

  public BodyPart getBodyPart(int paramInt)
    throws MessagingException
  {
    try
    {
      parse();
      BodyPart localBodyPart = super.getBodyPart(paramInt);
      return localBodyPart;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public BodyPart getBodyPart(String paramString)
    throws MessagingException
  {
    try
    {
      parse();
      int i = getCount();
      for (int j = 0; ; j++)
      {
        Object localObject2;
        if (j >= i)
          localObject2 = null;
        boolean bool;
        do
        {
          return localObject2;
          localObject2 = (MimeBodyPart)getBodyPart(j);
          String str = ((MimeBodyPart)localObject2).getContentID();
          if (str == null)
            break;
          bool = str.equals(paramString);
        }
        while (bool);
      }
    }
    finally
    {
    }
  }

  public int getCount()
    throws MessagingException
  {
    try
    {
      parse();
      int i = super.getCount();
      return i;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public String getPreamble()
    throws MessagingException
  {
    try
    {
      parse();
      String str = this.preamble;
      return str;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public boolean isComplete()
    throws MessagingException
  {
    try
    {
      parse();
      boolean bool = this.complete;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  protected void parse()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 56	javax/mail/internet/MimeMultipart:parsed	Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifeq +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: getstatic 24	javax/mail/internet/MimeMultipart:bmparse	Z
    //   17: ifeq +15 -> 32
    //   20: aload_0
    //   21: invokespecial 320	javax/mail/internet/MimeMultipart:parsebm	()V
    //   24: goto -13 -> 11
    //   27: astore_1
    //   28: aload_0
    //   29: monitorexit
    //   30: aload_1
    //   31: athrow
    //   32: lconst_0
    //   33: lstore_3
    //   34: lconst_0
    //   35: lstore 5
    //   37: aload_0
    //   38: getfield 54	javax/mail/internet/MimeMultipart:ds	Ljavax/activation/DataSource;
    //   41: invokeinterface 124 1 0
    //   46: astore 9
    //   48: aload 9
    //   50: instanceof 126
    //   53: ifne +34 -> 87
    //   56: aload 9
    //   58: instanceof 128
    //   61: ifne +26 -> 87
    //   64: aload 9
    //   66: instanceof 130
    //   69: ifne +18 -> 87
    //   72: new 128	java/io/BufferedInputStream
    //   75: dup
    //   76: aload 9
    //   78: invokespecial 133	java/io/BufferedInputStream:<init>	(Ljava/io/InputStream;)V
    //   81: astore 50
    //   83: aload 50
    //   85: astore 9
    //   87: aload 9
    //   89: instanceof 130
    //   92: istore 10
    //   94: aconst_null
    //   95: astore 11
    //   97: iload 10
    //   99: ifeq +10 -> 109
    //   102: aload 9
    //   104: checkcast 130	javax/mail/internet/SharedInputStream
    //   107: astore 11
    //   109: new 68	javax/mail/internet/ContentType
    //   112: dup
    //   113: aload_0
    //   114: getfield 85	javax/mail/internet/MimeMultipart:contentType	Ljava/lang/String;
    //   117: invokespecial 134	javax/mail/internet/ContentType:<init>	(Ljava/lang/String;)V
    //   120: ldc 75
    //   122: invokevirtual 137	javax/mail/internet/ContentType:getParameter	(Ljava/lang/String;)Ljava/lang/String;
    //   125: astore 12
    //   127: aload 12
    //   129: ifnull +116 -> 245
    //   132: new 139	java/lang/StringBuilder
    //   135: dup
    //   136: ldc 141
    //   138: invokespecial 142	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   141: aload 12
    //   143: invokevirtual 146	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   146: invokevirtual 147	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   149: astore 13
    //   151: aload 13
    //   153: astore 14
    //   155: new 149	com/sun/mail/util/LineInputStream
    //   158: dup
    //   159: aload 9
    //   161: invokespecial 150	com/sun/mail/util/LineInputStream:<init>	(Ljava/io/InputStream;)V
    //   164: astore 15
    //   166: aconst_null
    //   167: astore 16
    //   169: aconst_null
    //   170: astore 17
    //   172: aload 15
    //   174: invokevirtual 153	com/sun/mail/util/LineInputStream:readLine	()Ljava/lang/String;
    //   177: astore 22
    //   179: aload 22
    //   181: ifnonnull +87 -> 268
    //   184: aload 22
    //   186: ifnonnull +239 -> 425
    //   189: new 88	javax/mail/MessagingException
    //   192: dup
    //   193: ldc 155
    //   195: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   198: athrow
    //   199: astore 20
    //   201: new 88	javax/mail/MessagingException
    //   204: dup
    //   205: ldc 158
    //   207: aload 20
    //   209: invokespecial 161	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   212: astore 21
    //   214: aload 21
    //   216: athrow
    //   217: astore 18
    //   219: aload 9
    //   221: invokevirtual 166	java/io/InputStream:close	()V
    //   224: aload 18
    //   226: athrow
    //   227: astore 7
    //   229: new 88	javax/mail/MessagingException
    //   232: dup
    //   233: ldc 168
    //   235: aload 7
    //   237: invokespecial 161	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   240: astore 8
    //   242: aload 8
    //   244: athrow
    //   245: getstatic 22	javax/mail/internet/MimeMultipart:ignoreMissingBoundaryParameter	Z
    //   248: istore 49
    //   250: aconst_null
    //   251: astore 14
    //   253: iload 49
    //   255: ifne -100 -> 155
    //   258: new 88	javax/mail/MessagingException
    //   261: dup
    //   262: ldc 170
    //   264: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   267: athrow
    //   268: iconst_m1
    //   269: aload 22
    //   271: invokevirtual 174	java/lang/String:length	()I
    //   274: iadd
    //   275: istore 23
    //   277: goto +695 -> 972
    //   280: iload 23
    //   282: iconst_1
    //   283: iadd
    //   284: istore 24
    //   286: aload 22
    //   288: iconst_0
    //   289: iload 24
    //   291: invokevirtual 178	java/lang/String:substring	(II)Ljava/lang/String;
    //   294: astore 22
    //   296: aload 14
    //   298: ifnull +110 -> 408
    //   301: aload 22
    //   303: aload 14
    //   305: invokevirtual 182	java/lang/String:equals	(Ljava/lang/Object;)Z
    //   308: ifne -124 -> 184
    //   311: aload 22
    //   313: invokevirtual 174	java/lang/String:length	()I
    //   316: istore 25
    //   318: iload 25
    //   320: ifle -148 -> 172
    //   323: aload 17
    //   325: ifnonnull +16 -> 341
    //   328: ldc 184
    //   330: ldc 186
    //   332: invokestatic 189	java/lang/System:getProperty	(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
    //   335: astore 29
    //   337: aload 29
    //   339: astore 17
    //   341: aload 16
    //   343: ifnonnull +23 -> 366
    //   346: iconst_2
    //   347: aload 22
    //   349: invokevirtual 174	java/lang/String:length	()I
    //   352: iadd
    //   353: istore 27
    //   355: new 191	java/lang/StringBuffer
    //   358: dup
    //   359: iload 27
    //   361: invokespecial 194	java/lang/StringBuffer:<init>	(I)V
    //   364: astore 16
    //   366: aload 16
    //   368: aload 22
    //   370: invokevirtual 197	java/lang/StringBuffer:append	(Ljava/lang/String;)Ljava/lang/StringBuffer;
    //   373: aload 17
    //   375: invokevirtual 197	java/lang/StringBuffer:append	(Ljava/lang/String;)Ljava/lang/StringBuffer;
    //   378: pop
    //   379: goto -207 -> 172
    //   382: aload 22
    //   384: iload 23
    //   386: invokevirtual 201	java/lang/String:charAt	(I)C
    //   389: istore 48
    //   391: iload 48
    //   393: bipush 32
    //   395: if_icmpeq +585 -> 980
    //   398: iload 48
    //   400: bipush 9
    //   402: if_icmpne -122 -> 280
    //   405: goto +575 -> 980
    //   408: aload 22
    //   410: ldc 141
    //   412: invokevirtual 204	java/lang/String:startsWith	(Ljava/lang/String;)Z
    //   415: ifeq -104 -> 311
    //   418: aload 22
    //   420: astore 14
    //   422: goto -238 -> 184
    //   425: aload 16
    //   427: ifnull +12 -> 439
    //   430: aload_0
    //   431: aload 16
    //   433: invokevirtual 205	java/lang/StringBuffer:toString	()Ljava/lang/String;
    //   436: putfield 60	javax/mail/internet/MimeMultipart:preamble	Ljava/lang/String;
    //   439: aload 14
    //   441: invokestatic 211	com/sun/mail/util/ASCIIUtility:getBytes	(Ljava/lang/String;)[B
    //   444: astore 30
    //   446: aload 30
    //   448: arraylength
    //   449: istore 31
    //   451: iconst_0
    //   452: istore 32
    //   454: iload 32
    //   456: ifeq +16 -> 472
    //   459: aload 9
    //   461: invokevirtual 166	java/io/InputStream:close	()V
    //   464: aload_0
    //   465: iconst_1
    //   466: putfield 56	javax/mail/internet/MimeMultipart:parsed	Z
    //   469: goto -458 -> 11
    //   472: aload 11
    //   474: ifnull +63 -> 537
    //   477: aload 11
    //   479: invokeinterface 215 1 0
    //   484: lstore_3
    //   485: aload 15
    //   487: invokevirtual 153	com/sun/mail/util/LineInputStream:readLine	()Ljava/lang/String;
    //   490: astore 46
    //   492: aload 46
    //   494: ifnull +11 -> 505
    //   497: aload 46
    //   499: invokevirtual 174	java/lang/String:length	()I
    //   502: ifgt -17 -> 485
    //   505: aconst_null
    //   506: astore 33
    //   508: aload 46
    //   510: ifnonnull +35 -> 545
    //   513: getstatic 20	javax/mail/internet/MimeMultipart:ignoreMissingEndBoundary	Z
    //   516: ifne +13 -> 529
    //   519: new 88	javax/mail/MessagingException
    //   522: dup
    //   523: ldc 217
    //   525: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   528: athrow
    //   529: aload_0
    //   530: iconst_0
    //   531: putfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   534: goto -75 -> 459
    //   537: aload_0
    //   538: aload 9
    //   540: invokevirtual 221	javax/mail/internet/MimeMultipart:createInternetHeaders	(Ljava/io/InputStream;)Ljavax/mail/internet/InternetHeaders;
    //   543: astore 33
    //   545: aload 9
    //   547: invokevirtual 225	java/io/InputStream:markSupported	()Z
    //   550: ifne +13 -> 563
    //   553: new 88	javax/mail/MessagingException
    //   556: dup
    //   557: ldc 227
    //   559: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   562: athrow
    //   563: aload 11
    //   565: ifnonnull +112 -> 677
    //   568: new 229	java/io/ByteArrayOutputStream
    //   571: dup
    //   572: invokespecial 230	java/io/ByteArrayOutputStream:<init>	()V
    //   575: astore 34
    //   577: goto +418 -> 995
    //   580: iload 35
    //   582: ifeq +231 -> 813
    //   585: sipush 1000
    //   588: iload 31
    //   590: iconst_4
    //   591: iadd
    //   592: iadd
    //   593: istore 43
    //   595: aload 9
    //   597: iload 43
    //   599: invokevirtual 233	java/io/InputStream:mark	(I)V
    //   602: iconst_0
    //   603: istore 44
    //   605: goto +402 -> 1007
    //   608: iload 44
    //   610: iload 31
    //   612: if_icmpne +162 -> 774
    //   615: aload 9
    //   617: invokevirtual 252	java/io/InputStream:read	()I
    //   620: istore 45
    //   622: iload 45
    //   624: bipush 45
    //   626: if_icmpne +96 -> 722
    //   629: aload 9
    //   631: invokevirtual 252	java/io/InputStream:read	()I
    //   634: bipush 45
    //   636: if_icmpne +86 -> 722
    //   639: aload_0
    //   640: iconst_1
    //   641: putfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   644: iconst_1
    //   645: istore 32
    //   647: aload 11
    //   649: ifnull +289 -> 938
    //   652: aload_0
    //   653: aload 11
    //   655: lload_3
    //   656: lload 5
    //   658: invokeinterface 241 5 0
    //   663: invokevirtual 245	javax/mail/internet/MimeMultipart:createMimeBodyPart	(Ljava/io/InputStream;)Ljavax/mail/internet/MimeBodyPart;
    //   666: astore 39
    //   668: aload_0
    //   669: aload 39
    //   671: invokespecial 249	javax/mail/Multipart:addBodyPart	(Ljavax/mail/BodyPart;)V
    //   674: goto -220 -> 454
    //   677: aload 11
    //   679: invokeinterface 215 1 0
    //   684: lstore 5
    //   686: aconst_null
    //   687: astore 34
    //   689: goto +306 -> 995
    //   692: aload 9
    //   694: invokevirtual 252	java/io/InputStream:read	()I
    //   697: sipush 255
    //   700: aload 30
    //   702: iload 44
    //   704: baload
    //   705: iand
    //   706: if_icmpne -98 -> 608
    //   709: iinc 44 1
    //   712: goto +295 -> 1007
    //   715: aload 9
    //   717: invokevirtual 252	java/io/InputStream:read	()I
    //   720: istore 45
    //   722: iload 45
    //   724: bipush 32
    //   726: if_icmpeq -11 -> 715
    //   729: iload 45
    //   731: bipush 9
    //   733: if_icmpeq -18 -> 715
    //   736: iload 45
    //   738: bipush 10
    //   740: if_icmpeq -93 -> 647
    //   743: iload 45
    //   745: bipush 13
    //   747: if_icmpne +27 -> 774
    //   750: aload 9
    //   752: iconst_1
    //   753: invokevirtual 233	java/io/InputStream:mark	(I)V
    //   756: aload 9
    //   758: invokevirtual 252	java/io/InputStream:read	()I
    //   761: bipush 10
    //   763: if_icmpeq -116 -> 647
    //   766: aload 9
    //   768: invokevirtual 255	java/io/InputStream:reset	()V
    //   771: goto -124 -> 647
    //   774: aload 9
    //   776: invokevirtual 255	java/io/InputStream:reset	()V
    //   779: aload 34
    //   781: ifnull +32 -> 813
    //   784: iload 36
    //   786: iconst_m1
    //   787: if_icmpeq +26 -> 813
    //   790: aload 34
    //   792: iload 36
    //   794: invokevirtual 322	java/io/ByteArrayOutputStream:write	(I)V
    //   797: iload 37
    //   799: iconst_m1
    //   800: if_icmpeq +217 -> 1017
    //   803: aload 34
    //   805: iload 37
    //   807: invokevirtual 322	java/io/ByteArrayOutputStream:write	(I)V
    //   810: goto +207 -> 1017
    //   813: aload 9
    //   815: invokevirtual 252	java/io/InputStream:read	()I
    //   818: istore 38
    //   820: iload 38
    //   822: ifge +205 -> 1027
    //   825: getstatic 20	javax/mail/internet/MimeMultipart:ignoreMissingEndBoundary	Z
    //   828: ifne +13 -> 841
    //   831: new 88	javax/mail/MessagingException
    //   834: dup
    //   835: ldc 217
    //   837: invokespecial 156	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   840: athrow
    //   841: aload_0
    //   842: iconst_0
    //   843: putfield 58	javax/mail/internet/MimeMultipart:complete	Z
    //   846: iconst_1
    //   847: istore 32
    //   849: goto -202 -> 647
    //   852: iconst_1
    //   853: istore 35
    //   855: aload 11
    //   857: ifnull +14 -> 871
    //   860: aload 11
    //   862: invokeinterface 215 1 0
    //   867: lconst_1
    //   868: lsub
    //   869: lstore 5
    //   871: iload 38
    //   873: istore 36
    //   875: iload 38
    //   877: bipush 13
    //   879: if_icmpne -299 -> 580
    //   882: aload 9
    //   884: iconst_1
    //   885: invokevirtual 233	java/io/InputStream:mark	(I)V
    //   888: aload 9
    //   890: invokevirtual 252	java/io/InputStream:read	()I
    //   893: istore 42
    //   895: iload 42
    //   897: bipush 10
    //   899: if_icmpne +10 -> 909
    //   902: iload 42
    //   904: istore 37
    //   906: goto -326 -> 580
    //   909: aload 9
    //   911: invokevirtual 255	java/io/InputStream:reset	()V
    //   914: goto -334 -> 580
    //   917: iconst_0
    //   918: istore 35
    //   920: aload 34
    //   922: ifnull -342 -> 580
    //   925: aload 34
    //   927: iload 38
    //   929: invokevirtual 322	java/io/ByteArrayOutputStream:write	(I)V
    //   932: iconst_0
    //   933: istore 35
    //   935: goto -355 -> 580
    //   938: aload 34
    //   940: invokevirtual 273	java/io/ByteArrayOutputStream:toByteArray	()[B
    //   943: astore 40
    //   945: aload_0
    //   946: aload 33
    //   948: aload 40
    //   950: invokevirtual 276	javax/mail/internet/MimeMultipart:createMimeBodyPart	(Ljavax/mail/internet/InternetHeaders;[B)Ljavax/mail/internet/MimeBodyPart;
    //   953: astore 41
    //   955: aload 41
    //   957: astore 39
    //   959: goto -291 -> 668
    //   962: astore 19
    //   964: goto -740 -> 224
    //   967: astore 47
    //   969: goto -505 -> 464
    //   972: iload 23
    //   974: ifge -592 -> 382
    //   977: goto -697 -> 280
    //   980: iinc 23 255
    //   983: goto -11 -> 972
    //   986: astore 28
    //   988: ldc 186
    //   990: astore 17
    //   992: goto -651 -> 341
    //   995: iconst_1
    //   996: istore 35
    //   998: iconst_m1
    //   999: istore 36
    //   1001: iconst_m1
    //   1002: istore 37
    //   1004: goto -424 -> 580
    //   1007: iload 44
    //   1009: iload 31
    //   1011: if_icmplt -319 -> 692
    //   1014: goto -406 -> 608
    //   1017: iconst_m1
    //   1018: istore 37
    //   1020: iload 37
    //   1022: istore 36
    //   1024: goto -211 -> 813
    //   1027: iload 38
    //   1029: bipush 13
    //   1031: if_icmpeq -179 -> 852
    //   1034: iload 38
    //   1036: bipush 10
    //   1038: if_icmpne -121 -> 917
    //   1041: goto -189 -> 852
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	27	finally
    //   14	24	27	finally
    //   37	83	27	finally
    //   87	94	27	finally
    //   102	109	27	finally
    //   109	127	27	finally
    //   132	151	27	finally
    //   219	224	27	finally
    //   224	227	27	finally
    //   229	245	27	finally
    //   245	250	27	finally
    //   258	268	27	finally
    //   459	464	27	finally
    //   464	469	27	finally
    //   155	166	199	java/io/IOException
    //   172	179	199	java/io/IOException
    //   189	199	199	java/io/IOException
    //   268	277	199	java/io/IOException
    //   286	296	199	java/io/IOException
    //   301	311	199	java/io/IOException
    //   311	318	199	java/io/IOException
    //   328	337	199	java/io/IOException
    //   346	366	199	java/io/IOException
    //   366	379	199	java/io/IOException
    //   382	391	199	java/io/IOException
    //   408	418	199	java/io/IOException
    //   430	439	199	java/io/IOException
    //   439	451	199	java/io/IOException
    //   477	485	199	java/io/IOException
    //   485	492	199	java/io/IOException
    //   497	505	199	java/io/IOException
    //   513	529	199	java/io/IOException
    //   529	534	199	java/io/IOException
    //   537	545	199	java/io/IOException
    //   545	563	199	java/io/IOException
    //   568	577	199	java/io/IOException
    //   595	602	199	java/io/IOException
    //   615	622	199	java/io/IOException
    //   629	644	199	java/io/IOException
    //   652	668	199	java/io/IOException
    //   668	674	199	java/io/IOException
    //   677	686	199	java/io/IOException
    //   692	709	199	java/io/IOException
    //   715	722	199	java/io/IOException
    //   750	771	199	java/io/IOException
    //   774	779	199	java/io/IOException
    //   790	797	199	java/io/IOException
    //   803	810	199	java/io/IOException
    //   813	820	199	java/io/IOException
    //   825	841	199	java/io/IOException
    //   841	846	199	java/io/IOException
    //   860	871	199	java/io/IOException
    //   882	895	199	java/io/IOException
    //   909	914	199	java/io/IOException
    //   925	932	199	java/io/IOException
    //   938	955	199	java/io/IOException
    //   155	166	217	finally
    //   172	179	217	finally
    //   189	199	217	finally
    //   201	217	217	finally
    //   268	277	217	finally
    //   286	296	217	finally
    //   301	311	217	finally
    //   311	318	217	finally
    //   328	337	217	finally
    //   346	366	217	finally
    //   366	379	217	finally
    //   382	391	217	finally
    //   408	418	217	finally
    //   430	439	217	finally
    //   439	451	217	finally
    //   477	485	217	finally
    //   485	492	217	finally
    //   497	505	217	finally
    //   513	529	217	finally
    //   529	534	217	finally
    //   537	545	217	finally
    //   545	563	217	finally
    //   568	577	217	finally
    //   595	602	217	finally
    //   615	622	217	finally
    //   629	644	217	finally
    //   652	668	217	finally
    //   668	674	217	finally
    //   677	686	217	finally
    //   692	709	217	finally
    //   715	722	217	finally
    //   750	771	217	finally
    //   774	779	217	finally
    //   790	797	217	finally
    //   803	810	217	finally
    //   813	820	217	finally
    //   825	841	217	finally
    //   841	846	217	finally
    //   860	871	217	finally
    //   882	895	217	finally
    //   909	914	217	finally
    //   925	932	217	finally
    //   938	955	217	finally
    //   37	83	227	java/lang/Exception
    //   219	224	962	java/io/IOException
    //   459	464	967	java/io/IOException
    //   328	337	986	java/lang/SecurityException
  }

  public void removeBodyPart(int paramInt)
    throws MessagingException
  {
    parse();
    super.removeBodyPart(paramInt);
  }

  public boolean removeBodyPart(BodyPart paramBodyPart)
    throws MessagingException
  {
    parse();
    return super.removeBodyPart(paramBodyPart);
  }

  public void setPreamble(String paramString)
    throws MessagingException
  {
    try
    {
      this.preamble = paramString;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setSubType(String paramString)
    throws MessagingException
  {
    try
    {
      ContentType localContentType = new ContentType(this.contentType);
      localContentType.setSubType(paramString);
      this.contentType = localContentType.toString();
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void updateHeaders()
    throws MessagingException
  {
    for (int i = 0; ; i++)
    {
      if (i >= this.parts.size())
        return;
      ((MimeBodyPart)this.parts.elementAt(i)).updateHeaders();
    }
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException
  {
    while (true)
    {
      try
      {
        parse();
        String str = "--" + new ContentType(this.contentType).getParameter("boundary");
        LineOutputStream localLineOutputStream = new LineOutputStream(paramOutputStream);
        if (this.preamble != null)
        {
          byte[] arrayOfByte = ASCIIUtility.getBytes(this.preamble);
          localLineOutputStream.write(arrayOfByte);
          if ((arrayOfByte.length > 0) && (arrayOfByte[(-1 + arrayOfByte.length)] != 13) && (arrayOfByte[(-1 + arrayOfByte.length)] != 10))
          {
            localLineOutputStream.writeln();
            break label188;
            if (i >= this.parts.size())
            {
              localLineOutputStream.writeln(str + "--");
              return;
            }
            localLineOutputStream.writeln(str);
            ((MimeBodyPart)this.parts.elementAt(i)).writeTo(paramOutputStream);
            localLineOutputStream.writeln();
            i++;
            continue;
          }
        }
      }
      finally
      {
      }
      label188: int i = 0;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MimeMultipart
 * JD-Core Version:    0.6.2
 */