package com.sun.mail.smtp;

import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.BASE64EncoderStream;
import com.sun.mail.util.LineInputStream;
import com.sun.mail.util.SocketFetcher;
import com.sun.mail.util.TraceInputStream;
import com.sun.mail.util.TraceOutputStream;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.StringReader;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.Vector;
import javax.mail.Address;
import javax.mail.MessagingException;
import javax.mail.SendFailedException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.URLName;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimePart;
import javax.mail.internet.ParseException;

public class SMTPTransport extends Transport
{
  private static final byte[] CRLF;
  private static final String UNKNOWN = "UNKNOWN";
  private static char[] hexchar;
  private static final String[] ignoreList;
  private Address[] addresses;
  private SMTPOutputStream dataStream;
  private int defaultPort = 25;
  private MessagingException exception;
  private Hashtable extMap;
  private Address[] invalidAddr;
  private boolean isSSL = false;
  private int lastReturnCode;
  private String lastServerResponse;
  private LineInputStream lineInputStream;
  private String localHostName;
  private DigestMD5 md5support;
  private MimeMessage message;
  private String name = "smtp";
  private PrintStream out;
  private boolean quitWait = false;
  private boolean reportSuccess;
  private String saslRealm = "UNKNOWN";
  private boolean sendPartiallyFailed = false;
  private BufferedInputStream serverInput;
  private OutputStream serverOutput;
  private Socket serverSocket;
  private boolean useRset;
  private boolean useStartTLS;
  private Address[] validSentAddr;
  private Address[] validUnsentAddr;

  static
  {
    if (!SMTPTransport.class.desiredAssertionStatus());
    for (boolean bool = true; ; bool = false)
    {
      $assertionsDisabled = bool;
      ignoreList = new String[] { "Bcc", "Content-Length" };
      CRLF = new byte[] { 13, 10 };
      hexchar = new char[] { 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70 };
      return;
    }
  }

  public SMTPTransport(Session paramSession, URLName paramURLName)
  {
    this(paramSession, paramURLName, "smtp", 25, false);
  }

  protected SMTPTransport(Session paramSession, URLName paramURLName, String paramString, int paramInt, boolean paramBoolean)
  {
    super(paramSession, paramURLName);
    if (paramURLName != null)
      paramString = paramURLName.getProtocol();
    this.name = paramString;
    this.defaultPort = paramInt;
    this.isSSL = paramBoolean;
    this.out = paramSession.getDebugOut();
    String str1 = paramSession.getProperty("mail." + paramString + ".quitwait");
    boolean bool2;
    boolean bool3;
    label173: boolean bool4;
    if ((str1 != null) && (!str1.equalsIgnoreCase("true")))
    {
      bool2 = false;
      this.quitWait = bool2;
      String str2 = paramSession.getProperty("mail." + paramString + ".reportsuccess");
      if ((str2 == null) || (!str2.equalsIgnoreCase("true")))
        break label287;
      bool3 = bool1;
      this.reportSuccess = bool3;
      String str3 = paramSession.getProperty("mail." + paramString + ".starttls.enable");
      if ((str3 == null) || (!str3.equalsIgnoreCase("true")))
        break label293;
      bool4 = bool1;
      label225: this.useStartTLS = bool4;
      String str4 = paramSession.getProperty("mail." + paramString + ".userset");
      if ((str4 == null) || (!str4.equalsIgnoreCase("true")))
        break label299;
    }
    while (true)
    {
      this.useRset = bool1;
      return;
      bool2 = bool1;
      break;
      label287: bool3 = false;
      break label173;
      label293: bool4 = false;
      break label225;
      label299: bool1 = false;
    }
  }

  private void closeConnection()
    throws MessagingException
  {
    try
    {
      if (this.serverSocket != null)
        this.serverSocket.close();
      return;
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("Server Close Failed", localIOException);
    }
    finally
    {
      this.serverSocket = null;
      this.serverOutput = null;
      this.serverInput = null;
      this.lineInputStream = null;
      if (super.isConnected())
        super.close();
    }
  }

  private boolean convertTo8Bit(MimePart paramMimePart)
  {
    boolean bool1 = false;
    try
    {
      boolean bool2 = paramMimePart.isMimeType("text/*");
      bool1 = false;
      if (bool2)
      {
        String str = paramMimePart.getEncoding();
        bool1 = false;
        if (str != null)
          if (!str.equalsIgnoreCase("quoted-printable"))
          {
            boolean bool4 = str.equalsIgnoreCase("base64");
            bool1 = false;
            if (!bool4);
          }
          else
          {
            boolean bool3 = is8Bit(paramMimePart.getInputStream());
            bool1 = false;
            if (bool3)
            {
              paramMimePart.setContent(paramMimePart.getContent(), paramMimePart.getContentType());
              paramMimePart.setHeader("Content-Transfer-Encoding", "8bit");
              return true;
            }
          }
      }
      else
      {
        boolean bool5 = paramMimePart.isMimeType("multipart/*");
        bool1 = false;
        if (bool5)
        {
          MimeMultipart localMimeMultipart = (MimeMultipart)paramMimePart.getContent();
          int i = localMimeMultipart.getCount();
          for (int j = 0; j < i; j++)
          {
            boolean bool6 = convertTo8Bit((MimePart)localMimeMultipart.getBodyPart(j));
            if (bool6)
              bool1 = true;
          }
        }
      }
    }
    catch (MessagingException localMessagingException)
    {
      return bool1;
    }
    catch (IOException localIOException)
    {
    }
    return bool1;
  }

  private void expandGroups()
  {
    Vector localVector = null;
    int i = 0;
    if (i >= this.addresses.length)
    {
      if (localVector != null)
      {
        InternetAddress[] arrayOfInternetAddress2 = new InternetAddress[localVector.size()];
        localVector.copyInto(arrayOfInternetAddress2);
        this.addresses = arrayOfInternetAddress2;
      }
      return;
    }
    InternetAddress localInternetAddress = (InternetAddress)this.addresses[i];
    int j;
    if (localInternetAddress.isGroup())
      if (localVector == null)
      {
        localVector = new Vector();
        j = 0;
        label71: if (j < i)
          break label110;
      }
    while (true)
    {
      try
      {
        InternetAddress[] arrayOfInternetAddress1 = localInternetAddress.getGroup(true);
        if (arrayOfInternetAddress1 != null)
        {
          int k = 0;
          int m = arrayOfInternetAddress1.length;
          if (k >= m)
          {
            i++;
            break;
            label110: localVector.addElement(this.addresses[j]);
            j++;
            break label71;
          }
          localVector.addElement(arrayOfInternetAddress1[k]);
          k++;
          continue;
        }
        localVector.addElement(localInternetAddress);
        continue;
      }
      catch (ParseException localParseException)
      {
        localVector.addElement(localInternetAddress);
        continue;
      }
      if (localVector != null)
        localVector.addElement(localInternetAddress);
    }
  }

  private DigestMD5 getMD5()
  {
    try
    {
      if (this.md5support == null)
        if (!this.debug)
          break label42;
      label42: for (PrintStream localPrintStream = this.out; ; localPrintStream = null)
      {
        this.md5support = new DigestMD5(localPrintStream);
        DigestMD5 localDigestMD5 = this.md5support;
        return localDigestMD5;
      }
    }
    finally
    {
    }
  }

  private void initStreams()
    throws IOException
  {
    Properties localProperties = this.session.getProperties();
    PrintStream localPrintStream = this.session.getDebugOut();
    boolean bool1 = this.session.getDebug();
    String str = localProperties.getProperty("mail.debug.quote");
    if ((str != null) && (str.equalsIgnoreCase("true")));
    for (boolean bool2 = true; ; bool2 = false)
    {
      TraceInputStream localTraceInputStream = new TraceInputStream(this.serverSocket.getInputStream(), localPrintStream);
      localTraceInputStream.setTrace(bool1);
      localTraceInputStream.setQuote(bool2);
      TraceOutputStream localTraceOutputStream = new TraceOutputStream(this.serverSocket.getOutputStream(), localPrintStream);
      localTraceOutputStream.setTrace(bool1);
      localTraceOutputStream.setQuote(bool2);
      this.serverOutput = new BufferedOutputStream(localTraceOutputStream);
      this.serverInput = new BufferedInputStream(localTraceInputStream);
      this.lineInputStream = new LineInputStream(this.serverInput);
      return;
    }
  }

  private boolean is8Bit(InputStream paramInputStream)
  {
    int i = 0;
    boolean bool = false;
    try
    {
      int j = paramInputStream.read();
      if (j < 0)
      {
        if ((this.debug) && (bool))
          this.out.println("DEBUG SMTP: found an 8bit part");
        return bool;
      }
      int k = j & 0xFF;
      if ((k == 13) || (k == 10))
        i = 0;
      do
      {
        if (k <= 127)
          break;
        bool = true;
        break;
        if (k == 0)
          return false;
        i++;
      }
      while (i <= 998);
      return false;
    }
    catch (IOException localIOException)
    {
    }
    return false;
  }

  private boolean isNotLastLine(String paramString)
  {
    return (paramString != null) && (paramString.length() >= 4) && (paramString.charAt(3) == '-');
  }

  private void issueSendCommand(String paramString, int paramInt)
    throws MessagingException
  {
    sendCommand(paramString);
    int i = readServerResponse();
    if (i != paramInt)
    {
      int j;
      if (this.validSentAddr == null)
      {
        j = 0;
        if (this.validUnsentAddr != null)
          break label218;
      }
      label218: for (int k = 0; ; k = this.validUnsentAddr.length)
      {
        Address[] arrayOfAddress = new Address[j + k];
        if (j > 0)
          System.arraycopy(this.validSentAddr, 0, arrayOfAddress, 0, j);
        if (k > 0)
          System.arraycopy(this.validUnsentAddr, 0, arrayOfAddress, j, k);
        this.validSentAddr = null;
        this.validUnsentAddr = arrayOfAddress;
        if (this.debug)
          this.out.println("DEBUG SMTP: got response code " + i + ", with response: " + this.lastServerResponse);
        String str = this.lastServerResponse;
        int m = this.lastReturnCode;
        if (this.serverSocket != null)
          issueCommand("RSET", 250);
        this.lastServerResponse = str;
        this.lastReturnCode = m;
        throw new SMTPSendFailedException(paramString, i, this.lastServerResponse, this.exception, this.validSentAddr, this.validUnsentAddr, this.invalidAddr);
        j = this.validSentAddr.length;
        break;
      }
    }
  }

  private String normalizeAddress(String paramString)
  {
    if ((!paramString.startsWith("<")) && (!paramString.endsWith(">")))
      paramString = "<" + paramString + ">";
    return paramString;
  }

  private void openServer()
    throws MessagingException
  {
    int i = -1;
    String str = "UNKNOWN";
    try
    {
      i = this.serverSocket.getPort();
      str = this.serverSocket.getInetAddress().getHostName();
      if (this.debug)
        this.out.println("DEBUG SMTP: starting protocol to host \"" + str + "\", port " + i);
      initStreams();
      int j = readServerResponse();
      if (j != 220)
      {
        this.serverSocket.close();
        this.serverSocket = null;
        this.serverOutput = null;
        this.serverInput = null;
        this.lineInputStream = null;
        if (this.debug)
          this.out.println("DEBUG SMTP: got bad greeting from host \"" + str + "\", port: " + i + ", response: " + j + "\n");
        throw new MessagingException("Got bad greeting from SMTP host: " + str + ", port: " + i + ", response: " + j);
      }
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("Could not start protocol to SMTP host: " + str + ", port: " + i, localIOException);
    }
    if (this.debug)
      this.out.println("DEBUG SMTP: protocol started to host \"" + str + "\", port: " + i + "\n");
  }

  private void openServer(String paramString, int paramInt)
    throws MessagingException
  {
    if (this.debug)
      this.out.println("DEBUG SMTP: trying to connect to host \"" + paramString + "\", port " + paramInt + ", isSSL " + this.isSSL);
    try
    {
      this.serverSocket = SocketFetcher.getSocket(paramString, paramInt, this.session.getProperties(), "mail." + this.name, this.isSSL);
      paramInt = this.serverSocket.getPort();
      initStreams();
      int i = readServerResponse();
      if (i != 220)
      {
        this.serverSocket.close();
        this.serverSocket = null;
        this.serverOutput = null;
        this.serverInput = null;
        this.lineInputStream = null;
        if (this.debug)
          this.out.println("DEBUG SMTP: could not connect to host \"" + paramString + "\", port: " + paramInt + ", response: " + i + "\n");
        throw new MessagingException("Could not connect to SMTP host: " + paramString + ", port: " + paramInt + ", response: " + i);
      }
    }
    catch (UnknownHostException localUnknownHostException)
    {
      throw new MessagingException("Unknown SMTP host: " + paramString, localUnknownHostException);
      if (this.debug)
        this.out.println("DEBUG SMTP: connected to host \"" + paramString + "\", port: " + paramInt + "\n");
      return;
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("Could not connect to SMTP host: " + paramString + ", port: " + paramInt, localIOException);
    }
  }

  private void sendCommand(byte[] paramArrayOfByte)
    throws MessagingException
  {
    assert (Thread.holdsLock(this));
    try
    {
      this.serverOutput.write(paramArrayOfByte);
      this.serverOutput.write(CRLF);
      this.serverOutput.flush();
      return;
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("Can't send command to SMTP host", localIOException);
    }
  }

  protected static String xtext(String paramString)
  {
    StringBuffer localStringBuffer = null;
    int i = 0;
    if (i >= paramString.length())
    {
      if (localStringBuffer != null)
        paramString = localStringBuffer.toString();
      return paramString;
    }
    char c = paramString.charAt(i);
    if (c >= '')
      throw new IllegalArgumentException("Non-ASCII character in SMTP submitter: " + paramString);
    if ((c < '!') || (c > '~') || (c == '+') || (c == '='))
    {
      if (localStringBuffer == null)
      {
        localStringBuffer = new StringBuffer(4 + paramString.length());
        localStringBuffer.append(paramString.substring(0, i));
      }
      localStringBuffer.append('+');
      localStringBuffer.append(hexchar[((c & 0xF0) >> '\004')]);
      localStringBuffer.append(hexchar[(c & 0xF)]);
    }
    while (true)
    {
      i++;
      break;
      if (localStringBuffer != null)
        localStringBuffer.append(c);
    }
  }

  protected void checkConnected()
  {
    if (!super.isConnected())
      throw new IllegalStateException("Not connected");
  }

  // ERROR //
  public void close()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 188	javax/mail/Transport:isConnected	()Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifne +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aload_0
    //   15: getfield 174	com/sun/mail/smtp/SMTPTransport:serverSocket	Ljava/net/Socket;
    //   18: ifnull +62 -> 80
    //   21: aload_0
    //   22: ldc_w 531
    //   25: invokevirtual 371	com/sun/mail/smtp/SMTPTransport:sendCommand	(Ljava/lang/String;)V
    //   28: aload_0
    //   29: getfield 113	com/sun/mail/smtp/SMTPTransport:quitWait	Z
    //   32: ifeq +48 -> 80
    //   35: aload_0
    //   36: invokevirtual 374	com/sun/mail/smtp/SMTPTransport:readServerResponse	()I
    //   39: istore 4
    //   41: iload 4
    //   43: sipush 221
    //   46: if_icmpeq +34 -> 80
    //   49: iload 4
    //   51: iconst_m1
    //   52: if_icmpeq +28 -> 80
    //   55: aload_0
    //   56: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   59: new 131	java/lang/StringBuilder
    //   62: dup
    //   63: ldc_w 533
    //   66: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   69: iload 4
    //   71: invokevirtual 391	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   74: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   77: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   80: aload_0
    //   81: invokespecial 535	com/sun/mail/smtp/SMTPTransport:closeConnection	()V
    //   84: goto -73 -> 11
    //   87: astore_1
    //   88: aload_0
    //   89: monitorexit
    //   90: aload_1
    //   91: athrow
    //   92: astore_3
    //   93: aload_0
    //   94: invokespecial 535	com/sun/mail/smtp/SMTPTransport:closeConnection	()V
    //   97: aload_3
    //   98: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	87	finally
    //   80	84	87	finally
    //   93	99	87	finally
    //   14	41	92	finally
    //   55	80	92	finally
  }

  public void connect(Socket paramSocket)
    throws MessagingException
  {
    try
    {
      this.serverSocket = paramSocket;
      super.connect();
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected OutputStream data()
    throws MessagingException
  {
    assert (Thread.holdsLock(this));
    issueSendCommand("DATA", 354);
    this.dataStream = new SMTPOutputStream(this.serverOutput);
    return this.dataStream;
  }

  protected boolean ehlo(String paramString)
    throws MessagingException
  {
    String str1;
    if (paramString != null)
      str1 = "EHLO " + paramString;
    while (true)
    {
      sendCommand(str1);
      int i = readServerResponse();
      BufferedReader localBufferedReader;
      int j;
      if (i == 250)
      {
        localBufferedReader = new BufferedReader(new StringReader(this.lastServerResponse));
        this.extMap = new Hashtable();
        j = 1;
      }
      try
      {
        while (true)
        {
          String str2 = localBufferedReader.readLine();
          if (str2 == null)
          {
            label85: boolean bool = false;
            if (i == 250)
              bool = true;
            return bool;
            str1 = "EHLO";
            break;
          }
          if (j != 0)
          {
            j = 0;
          }
          else if (str2.length() >= 5)
          {
            String str3 = str2.substring(4);
            int k = str3.indexOf(' ');
            String str4 = "";
            if (k > 0)
            {
              str4 = str3.substring(k + 1);
              str3 = str3.substring(0, k);
            }
            if (this.debug)
              this.out.println("DEBUG SMTP: Found extension \"" + str3 + "\", arg \"" + str4 + "\"");
            this.extMap.put(str3.toUpperCase(Locale.ENGLISH), str4);
          }
        }
      }
      catch (IOException localIOException)
      {
        break label85;
      }
    }
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    try
    {
      closeConnection();
      return;
    }
    catch (MessagingException localMessagingException)
    {
    }
  }

  protected void finishData()
    throws IOException, MessagingException
  {
    assert (Thread.holdsLock(this));
    this.dataStream.ensureAtBOL();
    issueSendCommand(".", 250);
  }

  public String getExtensionParameter(String paramString)
  {
    if (this.extMap == null)
      return null;
    return (String)this.extMap.get(paramString.toUpperCase(Locale.ENGLISH));
  }

  public int getLastReturnCode()
  {
    try
    {
      int i = this.lastReturnCode;
      return i;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public String getLastServerResponse()
  {
    try
    {
      String str = this.lastServerResponse;
      return str;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  public String getLocalHost()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   6: ifnull +13 -> 19
    //   9: aload_0
    //   10: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   13: invokevirtual 362	java/lang/String:length	()I
    //   16: ifgt +39 -> 55
    //   19: aload_0
    //   20: aload_0
    //   21: getfield 297	com/sun/mail/smtp/SMTPTransport:session	Ljavax/mail/Session;
    //   24: new 131	java/lang/StringBuilder
    //   27: dup
    //   28: ldc 133
    //   30: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   33: aload_0
    //   34: getfield 105	com/sun/mail/smtp/SMTPTransport:name	Ljava/lang/String;
    //   37: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   40: ldc_w 622
    //   43: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   46: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   49: invokevirtual 149	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   52: putfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   55: aload_0
    //   56: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   59: ifnull +13 -> 72
    //   62: aload_0
    //   63: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   66: invokevirtual 362	java/lang/String:length	()I
    //   69: ifgt +39 -> 108
    //   72: aload_0
    //   73: aload_0
    //   74: getfield 297	com/sun/mail/smtp/SMTPTransport:session	Ljavax/mail/Session;
    //   77: new 131	java/lang/StringBuilder
    //   80: dup
    //   81: ldc 133
    //   83: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   86: aload_0
    //   87: getfield 105	com/sun/mail/smtp/SMTPTransport:name	Ljava/lang/String;
    //   90: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   93: ldc_w 624
    //   96: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   99: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   102: invokevirtual 149	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   105: putfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   108: aload_0
    //   109: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   112: ifnull +13 -> 125
    //   115: aload_0
    //   116: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   119: invokevirtual 362	java/lang/String:length	()I
    //   122: ifgt +55 -> 177
    //   125: invokestatic 626	java/net/InetAddress:getLocalHost	()Ljava/net/InetAddress;
    //   128: astore 4
    //   130: aload_0
    //   131: aload 4
    //   133: invokevirtual 435	java/net/InetAddress:getHostName	()Ljava/lang/String;
    //   136: putfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   139: aload_0
    //   140: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   143: ifnonnull +34 -> 177
    //   146: aload_0
    //   147: new 131	java/lang/StringBuilder
    //   150: dup
    //   151: ldc_w 628
    //   154: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   157: aload 4
    //   159: invokevirtual 631	java/net/InetAddress:getHostAddress	()Ljava/lang/String;
    //   162: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   165: ldc_w 633
    //   168: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   171: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   174: putfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   177: aload_0
    //   178: getfield 620	com/sun/mail/smtp/SMTPTransport:localHostName	Ljava/lang/String;
    //   181: astore_3
    //   182: aload_0
    //   183: monitorexit
    //   184: aload_3
    //   185: areturn
    //   186: astore_2
    //   187: aload_0
    //   188: monitorexit
    //   189: aload_2
    //   190: athrow
    //   191: astore_1
    //   192: goto -15 -> 177
    //
    // Exception table:
    //   from	to	target	type
    //   2	19	186	finally
    //   19	55	186	finally
    //   55	72	186	finally
    //   72	108	186	finally
    //   108	125	186	finally
    //   125	177	186	finally
    //   177	182	186	finally
    //   2	19	191	java/net/UnknownHostException
    //   19	55	191	java/net/UnknownHostException
    //   55	72	191	java/net/UnknownHostException
    //   72	108	191	java/net/UnknownHostException
    //   108	125	191	java/net/UnknownHostException
    //   125	177	191	java/net/UnknownHostException
  }

  public boolean getReportSuccess()
  {
    try
    {
      boolean bool = this.reportSuccess;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public String getSASLRealm()
  {
    try
    {
      if (this.saslRealm == "UNKNOWN")
      {
        this.saslRealm = this.session.getProperty("mail." + this.name + ".sasl.realm");
        if (this.saslRealm == null)
          this.saslRealm = this.session.getProperty("mail." + this.name + ".saslrealm");
      }
      String str = this.saslRealm;
      return str;
    }
    finally
    {
    }
  }

  public boolean getStartTLS()
  {
    try
    {
      boolean bool = this.useStartTLS;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public boolean getUseRset()
  {
    try
    {
      boolean bool = this.useRset;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void helo(String paramString)
    throws MessagingException
  {
    if (paramString != null)
    {
      issueCommand("HELO " + paramString, 250);
      return;
    }
    issueCommand("HELO", 250);
  }

  public boolean isConnected()
  {
    try
    {
      boolean bool1 = super.isConnected();
      boolean bool2 = false;
      if (!bool1);
      while (true)
      {
        return bool2;
        try
        {
          if (this.useRset)
            sendCommand("RSET");
          while (true)
          {
            int i = readServerResponse();
            if ((i < 0) || (i == 421))
              break label83;
            bool2 = true;
            break;
            sendCommand("NOOP");
          }
        }
        catch (Exception localException)
        {
          try
          {
            closeConnection();
            bool2 = false;
          }
          catch (MessagingException localMessagingException1)
          {
            bool2 = false;
          }
        }
        continue;
        try
        {
          label83: closeConnection();
          bool2 = false;
        }
        catch (MessagingException localMessagingException2)
        {
          bool2 = false;
        }
      }
    }
    finally
    {
    }
  }

  public void issueCommand(String paramString, int paramInt)
    throws MessagingException
  {
    try
    {
      sendCommand(paramString);
      if (readServerResponse() != paramInt)
        throw new MessagingException(this.lastServerResponse);
    }
    finally
    {
    }
  }

  protected void mailFrom()
    throws MessagingException
  {
    boolean bool1 = this.message instanceof SMTPMessage;
    String str1 = null;
    if (bool1)
      str1 = ((SMTPMessage)this.message).getEnvelopeFrom();
    if ((str1 == null) || (str1.length() <= 0))
      str1 = this.session.getProperty("mail." + this.name + ".from");
    Object localObject1;
    if ((str1 == null) || (str1.length() <= 0))
    {
      if (this.message == null)
        break label499;
      Address[] arrayOfAddress = this.message.getFrom();
      if ((arrayOfAddress == null) || (arrayOfAddress.length <= 0))
        break label499;
      localObject1 = arrayOfAddress[0];
    }
    while (true)
    {
      Object localObject2;
      String str3;
      if (localObject1 != null)
      {
        str1 = ((InternetAddress)localObject1).getAddress();
        localObject2 = "MAIL FROM:" + normalizeAddress(str1);
        if (supportsExtension("DSN"))
        {
          boolean bool4 = this.message instanceof SMTPMessage;
          String str6 = null;
          if (bool4)
            str6 = ((SMTPMessage)this.message).getDSNRet();
          if (str6 == null)
            str6 = this.session.getProperty("mail." + this.name + ".dsn.ret");
          if (str6 != null)
            localObject2 = localObject2 + " RET=" + str6;
        }
        if (supportsExtension("AUTH"))
        {
          boolean bool3 = this.message instanceof SMTPMessage;
          str3 = null;
          if (bool3)
            str3 = ((SMTPMessage)this.message).getSubmitter();
          if (str3 == null)
            str3 = this.session.getProperty("mail." + this.name + ".submitter");
          if (str3 == null);
        }
      }
      try
      {
        String str4 = xtext(str3);
        String str5 = localObject2 + " AUTH=" + str4;
        localObject2 = str5;
        boolean bool2 = this.message instanceof SMTPMessage;
        String str2 = null;
        if (bool2)
          str2 = ((SMTPMessage)this.message).getMailExtension();
        if (str2 == null)
          str2 = this.session.getProperty("mail." + this.name + ".mailextension");
        if ((str2 != null) && (str2.length() > 0))
          localObject2 = localObject2 + " " + str2;
        issueSendCommand((String)localObject2, 250);
        return;
        label499: localObject1 = InternetAddress.getLocalAddress(this.session);
        continue;
        throw new MessagingException("can't determine local email address");
      }
      catch (IllegalArgumentException localIllegalArgumentException)
      {
        while (true)
          if (this.debug)
            this.out.println("DEBUG SMTP: ignoring invalid submitter: " + str3 + ", Exception: " + localIllegalArgumentException);
      }
    }
  }

  protected boolean protocolConnect(String paramString1, int paramInt, String paramString2, String paramString3)
    throws MessagingException
  {
    String str1 = this.session.getProperty("mail." + this.name + ".ehlo");
    boolean bool1;
    if ((str1 != null) && (str1.equalsIgnoreCase("false")))
    {
      bool1 = false;
      String str2 = this.session.getProperty("mail." + this.name + ".auth");
      if ((str2 == null) || (!str2.equalsIgnoreCase("true")))
        break label170;
    }
    label170: for (boolean bool2 = true; ; bool2 = false)
    {
      if (this.debug)
        this.out.println("DEBUG SMTP: useEhlo " + bool1 + ", useAuth " + bool2);
      if ((!bool2) || ((paramString2 != null) && (paramString3 != null)))
        break label176;
      return false;
      bool1 = true;
      break;
    }
    label176: if (paramInt == -1)
    {
      String str5 = this.session.getProperty("mail." + this.name + ".port");
      if (str5 == null)
        break label558;
      paramInt = Integer.parseInt(str5);
    }
    while (true)
    {
      if ((paramString1 == null) || (paramString1.length() == 0))
        paramString1 = "localhost";
      label252: int i;
      if (this.serverSocket != null)
      {
        openServer();
        boolean bool3 = false;
        if (bool1)
          bool3 = ehlo(getLocalHost());
        if (!bool3)
          helo(getLocalHost());
        if ((this.useStartTLS) && (supportsExtension("STARTTLS")))
        {
          startTLS();
          ehlo(getLocalHost());
        }
        if (((!bool2) && ((paramString2 == null) || (paramString3 == null))) || ((!supportsExtension("AUTH")) && (!supportsExtension("AUTH=LOGIN"))))
          break label953;
        if (this.debug)
        {
          this.out.println("DEBUG SMTP: Attempt to authenticate");
          if ((!supportsAuthentication("LOGIN")) && (supportsExtension("AUTH=LOGIN")))
            this.out.println("DEBUG SMTP: use AUTH=LOGIN hack");
        }
        if ((!supportsAuthentication("LOGIN")) && (!supportsExtension("AUTH=LOGIN")))
          break;
        i = simpleCommand("AUTH LOGIN");
        if (i == 530)
        {
          startTLS();
          i = simpleCommand("AUTH LOGIN");
        }
      }
      try
      {
        ByteArrayOutputStream localByteArrayOutputStream1 = new ByteArrayOutputStream();
        BASE64EncoderStream localBASE64EncoderStream1 = new BASE64EncoderStream(localByteArrayOutputStream1, 2147483647);
        if (i == 334)
        {
          localBASE64EncoderStream1.write(ASCIIUtility.getBytes(paramString2));
          localBASE64EncoderStream1.flush();
          i = simpleCommand(localByteArrayOutputStream1.toByteArray());
          localByteArrayOutputStream1.reset();
        }
        if (i == 334)
        {
          localBASE64EncoderStream1.write(ASCIIUtility.getBytes(paramString3));
          localBASE64EncoderStream1.flush();
          i = simpleCommand(localByteArrayOutputStream1.toByteArray());
          localByteArrayOutputStream1.reset();
        }
        if (i == 235)
          break label953;
        closeConnection();
        return false;
        label558: paramInt = this.defaultPort;
        continue;
        openServer(paramString1, paramInt);
        break label252;
      }
      catch (IOException localIOException1)
      {
        if (i == 235)
          break label953;
        closeConnection();
        return false;
      }
      finally
      {
        if (i != 235)
        {
          closeConnection();
          return false;
        }
      }
    }
    if (supportsAuthentication("PLAIN"))
    {
      int m = simpleCommand("AUTH PLAIN");
      try
      {
        ByteArrayOutputStream localByteArrayOutputStream2 = new ByteArrayOutputStream();
        BASE64EncoderStream localBASE64EncoderStream2 = new BASE64EncoderStream(localByteArrayOutputStream2, 2147483647);
        if (m == 334)
        {
          localBASE64EncoderStream2.write(0);
          localBASE64EncoderStream2.write(ASCIIUtility.getBytes(paramString2));
          localBASE64EncoderStream2.write(0);
          localBASE64EncoderStream2.write(ASCIIUtility.getBytes(paramString3));
          localBASE64EncoderStream2.flush();
          int n = simpleCommand(localByteArrayOutputStream2.toByteArray());
          m = n;
        }
        if (m == 235)
          break label953;
        closeConnection();
        return false;
      }
      catch (IOException localIOException2)
      {
        if (m == 235)
          break label953;
        closeConnection();
        return false;
      }
      finally
      {
        if (m != 235)
        {
          closeConnection();
          return false;
        }
      }
    }
    else if (supportsAuthentication("DIGEST-MD5"))
    {
      DigestMD5 localDigestMD5 = getMD5();
      if (localDigestMD5 != null)
      {
        int j = simpleCommand("AUTH DIGEST-MD5");
        if (j == 334);
        try
        {
          String str3 = getSASLRealm();
          String str4 = this.lastServerResponse;
          j = simpleCommand(localDigestMD5.authClient(paramString1, paramString2, paramString3, str3, str4));
          if (j == 334)
          {
            boolean bool4 = localDigestMD5.authServer(this.lastServerResponse);
            if (bool4)
              break label870;
          }
          label870: int k;
          for (j = -1; j != 235; j = k)
          {
            closeConnection();
            return false;
            k = simpleCommand(new byte[0]);
          }
        }
        catch (Exception localException)
        {
          if (this.debug)
            this.out.println("DEBUG SMTP: DIGEST-MD5: " + localException);
          if (j != 235)
          {
            closeConnection();
            return false;
          }
        }
        finally
        {
          if (j != 235)
          {
            closeConnection();
            return false;
          }
        }
      }
    }
    label953: return true;
  }

  protected void rcptTo()
    throws MessagingException
  {
    Vector localVector1 = new Vector();
    Vector localVector2 = new Vector();
    Vector localVector3 = new Vector();
    Object localObject1 = null;
    int i = 0;
    this.invalidAddr = null;
    this.validUnsentAddr = null;
    this.validSentAddr = null;
    boolean bool1 = this.message instanceof SMTPMessage;
    boolean bool2 = false;
    if (bool1)
      bool2 = ((SMTPMessage)this.message).getSendPartial();
    if (!bool2)
    {
      String str5 = this.session.getProperty("mail." + this.name + ".sendpartial");
      if ((str5 == null) || (!str5.equalsIgnoreCase("true")))
        break label609;
      bool2 = true;
    }
    while (true)
    {
      if ((this.debug) && (bool2))
        this.out.println("DEBUG SMTP: sendPartial set");
      boolean bool3 = supportsExtension("DSN");
      int j = 0;
      String str1 = null;
      if (bool3)
      {
        boolean bool4 = this.message instanceof SMTPMessage;
        str1 = null;
        if (bool4)
          str1 = ((SMTPMessage)this.message).getDSNNotify();
        if (str1 == null)
          str1 = this.session.getProperty("mail." + this.name + ".dsn.notify");
        j = 0;
        if (str1 != null)
          j = 1;
      }
      int k = 0;
      int i8;
      int i9;
      label326: int i12;
      label342: label355: int i6;
      label390: int i4;
      label432: int i2;
      label474: String str4;
      int i1;
      if (k >= this.addresses.length)
      {
        if ((bool2) && (localVector1.size() == 0))
          i = 1;
        if (i == 0)
          break label1241;
        this.invalidAddr = new Address[localVector3.size()];
        localVector3.copyInto(this.invalidAddr);
        this.validUnsentAddr = new Address[localVector1.size() + localVector2.size()];
        i8 = 0;
        i9 = 0;
        int i10 = localVector1.size();
        if (i9 < i10)
          break label1169;
        i12 = 0;
        int i13 = localVector2.size();
        if (i12 < i13)
          break label1205;
        if (this.debug)
        {
          if ((this.validSentAddr != null) && (this.validSentAddr.length > 0))
          {
            this.out.println("DEBUG SMTP: Verified Addresses");
            i6 = 0;
            int i7 = this.validSentAddr.length;
            if (i6 < i7)
              break label1349;
          }
          if ((this.validUnsentAddr != null) && (this.validUnsentAddr.length > 0))
          {
            this.out.println("DEBUG SMTP: Valid Unsent Addresses");
            i4 = 0;
            int i5 = this.validUnsentAddr.length;
            if (i4 < i5)
              break label1385;
          }
          if ((this.invalidAddr != null) && (this.invalidAddr.length > 0))
          {
            this.out.println("DEBUG SMTP: Invalid Addresses");
            i2 = 0;
            int i3 = this.invalidAddr.length;
            if (i2 < i3)
              break label1421;
          }
        }
        if (i == 0)
          break;
        if (this.debug)
          this.out.println("DEBUG SMTP: Sending failed because of invalid destination addresses");
        notifyTransportListeners(2, this.validSentAddr, this.validUnsentAddr, this.invalidAddr, this.message);
        str4 = this.lastServerResponse;
        i1 = this.lastReturnCode;
      }
      try
      {
        if (this.serverSocket != null)
          issueCommand("RSET", 250);
        this.lastServerResponse = str4;
        this.lastReturnCode = i1;
        Address[] arrayOfAddress1 = this.validSentAddr;
        Address[] arrayOfAddress2 = this.validUnsentAddr;
        Address[] arrayOfAddress3 = this.invalidAddr;
        throw new SendFailedException("Invalid Addresses", (Exception)localObject1, arrayOfAddress1, arrayOfAddress2, arrayOfAddress3);
        label609: bool2 = false;
        continue;
        InternetAddress localInternetAddress = (InternetAddress)this.addresses[k];
        String str2 = "RCPT TO:" + normalizeAddress(localInternetAddress.getAddress());
        if (j != 0)
          str2 = str2 + " NOTIFY=" + str1;
        sendCommand(str2);
        int m = readServerResponse();
        label822: SMTPAddressFailedException localSMTPAddressFailedException3;
        switch (m)
        {
        default:
          if ((m >= 400) && (m <= 499))
          {
            localVector2.addElement(localInternetAddress);
            if (!bool2)
              i = 1;
            localSMTPAddressFailedException3 = new SMTPAddressFailedException(localInternetAddress, str2, m, this.lastServerResponse);
            if (localObject1 != null)
              break label1158;
            localObject1 = localSMTPAddressFailedException3;
          }
          break;
        case 250:
        case 251:
        case 501:
        case 503:
        case 550:
        case 551:
        case 553:
        case 450:
        case 451:
        case 452:
        case 552:
        }
        while (true)
        {
          k++;
          break;
          localVector1.addElement(localInternetAddress);
          if (this.reportSuccess)
          {
            SMTPAddressSucceededException localSMTPAddressSucceededException = new SMTPAddressSucceededException(localInternetAddress, str2, m, this.lastServerResponse);
            if (localObject1 == null)
            {
              localObject1 = localSMTPAddressSucceededException;
            }
            else
            {
              ((MessagingException)localObject1).setNextException(localSMTPAddressSucceededException);
              continue;
              if (!bool2)
                i = 1;
              localVector3.addElement(localInternetAddress);
              SMTPAddressFailedException localSMTPAddressFailedException2 = new SMTPAddressFailedException(localInternetAddress, str2, m, this.lastServerResponse);
              if (localObject1 == null)
              {
                localObject1 = localSMTPAddressFailedException2;
              }
              else
              {
                ((MessagingException)localObject1).setNextException(localSMTPAddressFailedException2);
                continue;
                if (!bool2)
                  i = 1;
                localVector2.addElement(localInternetAddress);
                SMTPAddressFailedException localSMTPAddressFailedException1 = new SMTPAddressFailedException(localInternetAddress, str2, m, this.lastServerResponse);
                if (localObject1 == null)
                {
                  localObject1 = localSMTPAddressFailedException1;
                }
                else
                {
                  ((MessagingException)localObject1).setNextException(localSMTPAddressFailedException1);
                  continue;
                  if ((m >= 500) && (m <= 599))
                  {
                    localVector3.addElement(localInternetAddress);
                    break label822;
                  }
                  if (this.debug)
                    this.out.println("DEBUG SMTP: got response code " + m + ", with response: " + this.lastServerResponse);
                  String str3 = this.lastServerResponse;
                  int n = this.lastReturnCode;
                  if (this.serverSocket != null)
                    issueCommand("RSET", 250);
                  throw new SMTPAddressFailedException(localInternetAddress, str2, m, str3);
                  label1158: ((MessagingException)localObject1).setNextException(localSMTPAddressFailedException3);
                }
              }
            }
          }
        }
        label1169: Address[] arrayOfAddress4 = this.validUnsentAddr;
        int i11 = i8 + 1;
        arrayOfAddress4[i8] = ((Address)localVector1.elementAt(i9));
        i9++;
        i8 = i11;
        break label326;
        label1205: Address[] arrayOfAddress5 = this.validUnsentAddr;
        int i14 = i8 + 1;
        arrayOfAddress5[i8] = ((Address)localVector2.elementAt(i12));
        i12++;
        i8 = i14;
        break label342;
        label1241: if ((this.reportSuccess) || ((bool2) && ((localVector3.size() > 0) || (localVector2.size() > 0))))
        {
          this.sendPartiallyFailed = true;
          this.exception = ((MessagingException)localObject1);
          this.invalidAddr = new Address[localVector3.size()];
          localVector3.copyInto(this.invalidAddr);
          this.validUnsentAddr = new Address[localVector2.size()];
          localVector2.copyInto(this.validUnsentAddr);
          this.validSentAddr = new Address[localVector1.size()];
          localVector1.copyInto(this.validSentAddr);
          break label355;
        }
        this.validSentAddr = this.addresses;
        break label355;
        label1349: this.out.println("DEBUG SMTP:   " + this.validSentAddr[i6]);
        i6++;
        break label390;
        label1385: this.out.println("DEBUG SMTP:   " + this.validUnsentAddr[i4]);
        i4++;
        break label432;
        label1421: this.out.println("DEBUG SMTP:   " + this.invalidAddr[i2]);
        i2++;
        break label474;
      }
      catch (MessagingException localMessagingException1)
      {
        try
        {
          close();
        }
        catch (MessagingException localMessagingException2)
        {
          while (true)
            if (this.debug)
              localMessagingException2.printStackTrace(this.out);
        }
      }
      finally
      {
        this.lastServerResponse = str4;
        this.lastReturnCode = i1;
      }
    }
  }

  // ERROR //
  protected int readServerResponse()
    throws MessagingException
  {
    // Byte code:
    //   0: getstatic 64	com/sun/mail/smtp/SMTPTransport:$assertionsDisabled	Z
    //   3: ifne +18 -> 21
    //   6: aload_0
    //   7: invokestatic 488	java/lang/Thread:holdsLock	(Ljava/lang/Object;)Z
    //   10: ifne +11 -> 21
    //   13: new 490	java/lang/AssertionError
    //   16: dup
    //   17: invokespecial 491	java/lang/AssertionError:<init>	()V
    //   20: athrow
    //   21: new 504	java/lang/StringBuffer
    //   24: dup
    //   25: bipush 100
    //   27: invokespecial 513	java/lang/StringBuffer:<init>	(I)V
    //   30: astore_1
    //   31: aload_0
    //   32: getfield 185	com/sun/mail/smtp/SMTPTransport:lineInputStream	Lcom/sun/mail/util/LineInputStream;
    //   35: invokevirtual 884	com/sun/mail/util/LineInputStream:readLine	()Ljava/lang/String;
    //   38: astore_3
    //   39: aload_3
    //   40: ifnonnull +67 -> 107
    //   43: aload_1
    //   44: invokevirtual 505	java/lang/StringBuffer:toString	()Ljava/lang/String;
    //   47: astore 4
    //   49: aload 4
    //   51: invokevirtual 362	java/lang/String:length	()I
    //   54: ifne +8 -> 62
    //   57: ldc_w 886
    //   60: astore 4
    //   62: aload_0
    //   63: aload 4
    //   65: putfield 395	com/sun/mail/smtp/SMTPTransport:lastServerResponse	Ljava/lang/String;
    //   68: aload_0
    //   69: iconst_m1
    //   70: putfield 397	com/sun/mail/smtp/SMTPTransport:lastReturnCode	I
    //   73: aload_0
    //   74: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   77: ifeq +269 -> 346
    //   80: aload_0
    //   81: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   84: new 131	java/lang/StringBuilder
    //   87: dup
    //   88: ldc_w 888
    //   91: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   94: aload 4
    //   96: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   99: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   102: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   105: iconst_m1
    //   106: ireturn
    //   107: aload_1
    //   108: aload_3
    //   109: invokevirtual 520	java/lang/StringBuffer:append	(Ljava/lang/String;)Ljava/lang/StringBuffer;
    //   112: pop
    //   113: aload_1
    //   114: ldc_w 449
    //   117: invokevirtual 520	java/lang/StringBuffer:append	(Ljava/lang/String;)Ljava/lang/StringBuffer;
    //   120: pop
    //   121: aload_0
    //   122: aload_3
    //   123: invokespecial 890	com/sun/mail/smtp/SMTPTransport:isNotLastLine	(Ljava/lang/String;)Z
    //   126: ifne -95 -> 31
    //   129: aload_1
    //   130: invokevirtual 505	java/lang/StringBuffer:toString	()Ljava/lang/String;
    //   133: astore 7
    //   135: aload 7
    //   137: ifnull +203 -> 340
    //   140: aload 7
    //   142: invokevirtual 362	java/lang/String:length	()I
    //   145: iconst_3
    //   146: if_icmplt +194 -> 340
    //   149: aload 7
    //   151: iconst_0
    //   152: iconst_3
    //   153: invokevirtual 517	java/lang/String:substring	(II)Ljava/lang/String;
    //   156: invokestatic 740	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   159: istore 13
    //   161: iload 13
    //   163: istore 8
    //   165: iload 8
    //   167: iconst_m1
    //   168: if_icmpne +35 -> 203
    //   171: aload_0
    //   172: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   175: ifeq +28 -> 203
    //   178: aload_0
    //   179: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   182: new 131	java/lang/StringBuilder
    //   185: dup
    //   186: ldc_w 892
    //   189: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   192: aload 7
    //   194: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   197: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   200: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   203: aload_0
    //   204: aload 7
    //   206: putfield 395	com/sun/mail/smtp/SMTPTransport:lastServerResponse	Ljava/lang/String;
    //   209: aload_0
    //   210: iload 8
    //   212: putfield 397	com/sun/mail/smtp/SMTPTransport:lastReturnCode	I
    //   215: iload 8
    //   217: ireturn
    //   218: astore_2
    //   219: aload_0
    //   220: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   223: ifeq +27 -> 250
    //   226: aload_0
    //   227: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   230: new 131	java/lang/StringBuilder
    //   233: dup
    //   234: ldc_w 894
    //   237: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   240: aload_2
    //   241: invokevirtual 720	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   244: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   247: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   250: aload_0
    //   251: ldc_w 579
    //   254: putfield 395	com/sun/mail/smtp/SMTPTransport:lastServerResponse	Ljava/lang/String;
    //   257: aload_0
    //   258: iconst_0
    //   259: putfield 397	com/sun/mail/smtp/SMTPTransport:lastReturnCode	I
    //   262: new 170	javax/mail/MessagingException
    //   265: dup
    //   266: ldc_w 896
    //   269: aload_2
    //   270: invokespecial 194	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   273: athrow
    //   274: astore 11
    //   276: aload_0
    //   277: invokevirtual 876	com/sun/mail/smtp/SMTPTransport:close	()V
    //   280: iconst_m1
    //   281: istore 8
    //   283: goto -118 -> 165
    //   286: astore 12
    //   288: aload_0
    //   289: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   292: ifeq -12 -> 280
    //   295: aload 12
    //   297: aload_0
    //   298: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   301: invokevirtual 879	javax/mail/MessagingException:printStackTrace	(Ljava/io/PrintStream;)V
    //   304: goto -24 -> 280
    //   307: astore 9
    //   309: aload_0
    //   310: invokevirtual 876	com/sun/mail/smtp/SMTPTransport:close	()V
    //   313: iconst_m1
    //   314: istore 8
    //   316: goto -151 -> 165
    //   319: astore 10
    //   321: aload_0
    //   322: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   325: ifeq -12 -> 313
    //   328: aload 10
    //   330: aload_0
    //   331: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   334: invokevirtual 879	javax/mail/MessagingException:printStackTrace	(Ljava/io/PrintStream;)V
    //   337: goto -24 -> 313
    //   340: iconst_m1
    //   341: istore 8
    //   343: goto -178 -> 165
    //   346: iconst_m1
    //   347: ireturn
    //
    // Exception table:
    //   from	to	target	type
    //   31	39	218	java/io/IOException
    //   43	57	218	java/io/IOException
    //   62	105	218	java/io/IOException
    //   107	135	218	java/io/IOException
    //   149	161	274	java/lang/NumberFormatException
    //   276	280	286	javax/mail/MessagingException
    //   149	161	307	java/lang/StringIndexOutOfBoundsException
    //   309	313	319	javax/mail/MessagingException
  }

  protected void sendCommand(String paramString)
    throws MessagingException
  {
    sendCommand(ASCIIUtility.getBytes(paramString));
  }

  // ERROR //
  public void sendMessage(javax.mail.Message paramMessage, Address[] paramArrayOfAddress)
    throws MessagingException, SendFailedException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 902	com/sun/mail/smtp/SMTPTransport:checkConnected	()V
    //   6: aload_1
    //   7: instanceof 662
    //   10: ifne +36 -> 46
    //   13: aload_0
    //   14: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   17: ifeq +13 -> 30
    //   20: aload_0
    //   21: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   24: ldc_w 904
    //   27: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   30: new 170	javax/mail/MessagingException
    //   33: dup
    //   34: ldc_w 906
    //   37: invokespecial 454	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   40: athrow
    //   41: astore_3
    //   42: aload_0
    //   43: monitorexit
    //   44: aload_3
    //   45: athrow
    //   46: iconst_0
    //   47: istore 4
    //   49: iload 4
    //   51: aload_2
    //   52: arraylength
    //   53: if_icmplt +362 -> 415
    //   56: aload_0
    //   57: aload_1
    //   58: checkcast 662	javax/mail/internet/MimeMessage
    //   61: putfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   64: aload_0
    //   65: aload_2
    //   66: putfield 256	com/sun/mail/smtp/SMTPTransport:addresses	[Ljavax/mail/Address;
    //   69: aload_0
    //   70: aload_2
    //   71: putfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   74: aload_0
    //   75: invokespecial 908	com/sun/mail/smtp/SMTPTransport:expandGroups	()V
    //   78: aload_1
    //   79: instanceof 655
    //   82: istore 5
    //   84: iconst_0
    //   85: istore 6
    //   87: iload 5
    //   89: ifeq +12 -> 101
    //   92: aload_1
    //   93: checkcast 655	com/sun/mail/smtp/SMTPMessage
    //   96: invokevirtual 911	com/sun/mail/smtp/SMTPMessage:getAllow8bitMIME	()Z
    //   99: istore 6
    //   101: iload 6
    //   103: ifne +55 -> 158
    //   106: aload_0
    //   107: getfield 297	com/sun/mail/smtp/SMTPTransport:session	Ljavax/mail/Session;
    //   110: new 131	java/lang/StringBuilder
    //   113: dup
    //   114: ldc 133
    //   116: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   119: aload_0
    //   120: getfield 105	com/sun/mail/smtp/SMTPTransport:name	Ljava/lang/String;
    //   123: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   126: ldc_w 913
    //   129: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   132: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   135: invokevirtual 149	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   138: astore 7
    //   140: aload 7
    //   142: ifnull +320 -> 462
    //   145: aload 7
    //   147: ldc 151
    //   149: invokevirtual 155	java/lang/String:equalsIgnoreCase	(Ljava/lang/String;)Z
    //   152: ifeq +310 -> 462
    //   155: iconst_1
    //   156: istore 6
    //   158: aload_0
    //   159: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   162: ifeq +28 -> 190
    //   165: aload_0
    //   166: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   169: new 131	java/lang/StringBuilder
    //   172: dup
    //   173: ldc_w 915
    //   176: invokespecial 136	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   179: iload 6
    //   181: invokevirtual 467	java/lang/StringBuilder:append	(Z)Ljava/lang/StringBuilder;
    //   184: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   187: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   190: iload 6
    //   192: ifeq +35 -> 227
    //   195: aload_0
    //   196: ldc_w 917
    //   199: invokevirtual 678	com/sun/mail/smtp/SMTPTransport:supportsExtension	(Ljava/lang/String;)Z
    //   202: ifeq +25 -> 227
    //   205: aload_0
    //   206: aload_0
    //   207: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   210: invokespecial 251	com/sun/mail/smtp/SMTPTransport:convertTo8Bit	(Ljavax/mail/internet/MimePart;)Z
    //   213: istore 12
    //   215: iload 12
    //   217: ifeq +10 -> 227
    //   220: aload_0
    //   221: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   224: invokevirtual 920	javax/mail/internet/MimeMessage:saveChanges	()V
    //   227: aload_0
    //   228: invokevirtual 922	com/sun/mail/smtp/SMTPTransport:mailFrom	()V
    //   231: aload_0
    //   232: invokevirtual 924	com/sun/mail/smtp/SMTPTransport:rcptTo	()V
    //   235: aload_0
    //   236: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   239: aload_0
    //   240: invokevirtual 926	com/sun/mail/smtp/SMTPTransport:data	()Ljava/io/OutputStream;
    //   243: getstatic 72	com/sun/mail/smtp/SMTPTransport:ignoreList	[Ljava/lang/String;
    //   246: invokevirtual 930	javax/mail/internet/MimeMessage:writeTo	(Ljava/io/OutputStream;[Ljava/lang/String;)V
    //   249: aload_0
    //   250: invokevirtual 932	com/sun/mail/smtp/SMTPTransport:finishData	()V
    //   253: aload_0
    //   254: getfield 111	com/sun/mail/smtp/SMTPTransport:sendPartiallyFailed	Z
    //   257: ifeq +211 -> 468
    //   260: aload_0
    //   261: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   264: ifeq +13 -> 277
    //   267: aload_0
    //   268: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   271: ldc_w 934
    //   274: invokevirtual 358	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   277: aload_0
    //   278: iconst_3
    //   279: aload_0
    //   280: getfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   283: aload_0
    //   284: getfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   287: aload_0
    //   288: getfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   291: aload_0
    //   292: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   295: invokevirtual 846	com/sun/mail/smtp/SMTPTransport:notifyTransportListeners	(I[Ljavax/mail/Address;[Ljavax/mail/Address;[Ljavax/mail/Address;Ljavax/mail/Message;)V
    //   298: new 404	com/sun/mail/smtp/SMTPSendFailedException
    //   301: dup
    //   302: ldc_w 610
    //   305: aload_0
    //   306: getfield 397	com/sun/mail/smtp/SMTPTransport:lastReturnCode	I
    //   309: aload_0
    //   310: getfield 395	com/sun/mail/smtp/SMTPTransport:lastServerResponse	Ljava/lang/String;
    //   313: aload_0
    //   314: getfield 406	com/sun/mail/smtp/SMTPTransport:exception	Ljavax/mail/MessagingException;
    //   317: aload_0
    //   318: getfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   321: aload_0
    //   322: getfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   325: aload_0
    //   326: getfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   329: invokespecial 411	com/sun/mail/smtp/SMTPSendFailedException:<init>	(Ljava/lang/String;ILjava/lang/String;Ljava/lang/Exception;[Ljavax/mail/Address;[Ljavax/mail/Address;[Ljavax/mail/Address;)V
    //   332: athrow
    //   333: astore 11
    //   335: aload_0
    //   336: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   339: ifeq +12 -> 351
    //   342: aload 11
    //   344: aload_0
    //   345: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   348: invokevirtual 879	javax/mail/MessagingException:printStackTrace	(Ljava/io/PrintStream;)V
    //   351: aload_0
    //   352: iconst_2
    //   353: aload_0
    //   354: getfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   357: aload_0
    //   358: getfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   361: aload_0
    //   362: getfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   365: aload_0
    //   366: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   369: invokevirtual 846	com/sun/mail/smtp/SMTPTransport:notifyTransportListeners	(I[Ljavax/mail/Address;[Ljavax/mail/Address;[Ljavax/mail/Address;Ljavax/mail/Message;)V
    //   372: aload 11
    //   374: athrow
    //   375: astore 10
    //   377: aload_0
    //   378: aconst_null
    //   379: putfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   382: aload_0
    //   383: aconst_null
    //   384: putfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   387: aload_0
    //   388: aconst_null
    //   389: putfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   392: aload_0
    //   393: aconst_null
    //   394: putfield 256	com/sun/mail/smtp/SMTPTransport:addresses	[Ljavax/mail/Address;
    //   397: aload_0
    //   398: aconst_null
    //   399: putfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   402: aload_0
    //   403: aconst_null
    //   404: putfield 406	com/sun/mail/smtp/SMTPTransport:exception	Ljavax/mail/MessagingException;
    //   407: aload_0
    //   408: iconst_0
    //   409: putfield 111	com/sun/mail/smtp/SMTPTransport:sendPartiallyFailed	Z
    //   412: aload 10
    //   414: athrow
    //   415: aload_2
    //   416: iload 4
    //   418: aaload
    //   419: instanceof 263
    //   422: ifne +34 -> 456
    //   425: new 170	javax/mail/MessagingException
    //   428: dup
    //   429: new 131	java/lang/StringBuilder
    //   432: dup
    //   433: invokespecial 935	java/lang/StringBuilder:<init>	()V
    //   436: aload_2
    //   437: iload 4
    //   439: aaload
    //   440: invokevirtual 720	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   443: ldc_w 937
    //   446: invokevirtual 140	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   449: invokevirtual 145	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   452: invokespecial 454	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   455: athrow
    //   456: iinc 4 1
    //   459: goto -410 -> 49
    //   462: iconst_0
    //   463: istore 6
    //   465: goto -307 -> 158
    //   468: aload_0
    //   469: iconst_1
    //   470: aload_0
    //   471: getfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   474: aload_0
    //   475: getfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   478: aload_0
    //   479: getfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   482: aload_0
    //   483: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   486: invokevirtual 846	com/sun/mail/smtp/SMTPTransport:notifyTransportListeners	(I[Ljavax/mail/Address;[Ljavax/mail/Address;[Ljavax/mail/Address;Ljavax/mail/Message;)V
    //   489: aload_0
    //   490: aconst_null
    //   491: putfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   494: aload_0
    //   495: aconst_null
    //   496: putfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   499: aload_0
    //   500: aconst_null
    //   501: putfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   504: aload_0
    //   505: aconst_null
    //   506: putfield 256	com/sun/mail/smtp/SMTPTransport:addresses	[Ljavax/mail/Address;
    //   509: aload_0
    //   510: aconst_null
    //   511: putfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   514: aload_0
    //   515: aconst_null
    //   516: putfield 406	com/sun/mail/smtp/SMTPTransport:exception	Ljavax/mail/MessagingException;
    //   519: aload_0
    //   520: iconst_0
    //   521: putfield 111	com/sun/mail/smtp/SMTPTransport:sendPartiallyFailed	Z
    //   524: aload_0
    //   525: monitorexit
    //   526: return
    //   527: astore 8
    //   529: aload_0
    //   530: getfield 287	com/sun/mail/smtp/SMTPTransport:debug	Z
    //   533: ifeq +12 -> 545
    //   536: aload 8
    //   538: aload_0
    //   539: getfield 129	com/sun/mail/smtp/SMTPTransport:out	Ljava/io/PrintStream;
    //   542: invokevirtual 938	java/io/IOException:printStackTrace	(Ljava/io/PrintStream;)V
    //   545: aload_0
    //   546: invokespecial 535	com/sun/mail/smtp/SMTPTransport:closeConnection	()V
    //   549: aload_0
    //   550: iconst_2
    //   551: aload_0
    //   552: getfield 376	com/sun/mail/smtp/SMTPTransport:validSentAddr	[Ljavax/mail/Address;
    //   555: aload_0
    //   556: getfield 378	com/sun/mail/smtp/SMTPTransport:validUnsentAddr	[Ljavax/mail/Address;
    //   559: aload_0
    //   560: getfield 408	com/sun/mail/smtp/SMTPTransport:invalidAddr	[Ljavax/mail/Address;
    //   563: aload_0
    //   564: getfield 653	com/sun/mail/smtp/SMTPTransport:message	Ljavax/mail/internet/MimeMessage;
    //   567: invokevirtual 846	com/sun/mail/smtp/SMTPTransport:notifyTransportListeners	(I[Ljavax/mail/Address;[Ljavax/mail/Address;[Ljavax/mail/Address;Ljavax/mail/Message;)V
    //   570: new 170	javax/mail/MessagingException
    //   573: dup
    //   574: ldc_w 940
    //   577: aload 8
    //   579: invokespecial 194	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   582: athrow
    //   583: astore 9
    //   585: goto -36 -> 549
    //   588: astore 13
    //   590: goto -363 -> 227
    //
    // Exception table:
    //   from	to	target	type
    //   2	30	41	finally
    //   30	41	41	finally
    //   49	84	41	finally
    //   92	101	41	finally
    //   106	140	41	finally
    //   145	155	41	finally
    //   158	190	41	finally
    //   195	215	41	finally
    //   220	227	41	finally
    //   377	415	41	finally
    //   415	456	41	finally
    //   489	524	41	finally
    //   227	277	333	javax/mail/MessagingException
    //   277	333	333	javax/mail/MessagingException
    //   468	489	333	javax/mail/MessagingException
    //   227	277	375	finally
    //   277	333	375	finally
    //   335	351	375	finally
    //   351	375	375	finally
    //   468	489	375	finally
    //   529	545	375	finally
    //   545	549	375	finally
    //   549	583	375	finally
    //   227	277	527	java/io/IOException
    //   277	333	527	java/io/IOException
    //   468	489	527	java/io/IOException
    //   545	549	583	javax/mail/MessagingException
    //   220	227	588	javax/mail/MessagingException
  }

  public void setLocalHost(String paramString)
  {
    try
    {
      this.localHostName = paramString;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setReportSuccess(boolean paramBoolean)
  {
    try
    {
      this.reportSuccess = paramBoolean;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setSASLRealm(String paramString)
  {
    try
    {
      this.saslRealm = paramString;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setStartTLS(boolean paramBoolean)
  {
    try
    {
      this.useStartTLS = paramBoolean;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setUseRset(boolean paramBoolean)
  {
    try
    {
      this.useRset = paramBoolean;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public int simpleCommand(String paramString)
    throws MessagingException
  {
    try
    {
      sendCommand(paramString);
      int i = readServerResponse();
      return i;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected int simpleCommand(byte[] paramArrayOfByte)
    throws MessagingException
  {
    assert (Thread.holdsLock(this));
    sendCommand(paramArrayOfByte);
    return readServerResponse();
  }

  protected void startTLS()
    throws MessagingException
  {
    issueCommand("STARTTLS", 220);
    try
    {
      this.serverSocket = SocketFetcher.startTLS(this.serverSocket, this.session.getProperties(), "mail." + this.name);
      initStreams();
      return;
    }
    catch (IOException localIOException)
    {
      closeConnection();
      throw new MessagingException("Could not convert socket to TLS", localIOException);
    }
  }

  protected boolean supportsAuthentication(String paramString)
  {
    assert (Thread.holdsLock(this));
    if (this.extMap == null);
    StringTokenizer localStringTokenizer;
    do
      while (!localStringTokenizer.hasMoreTokens())
      {
        String str;
        do
        {
          return false;
          str = (String)this.extMap.get("AUTH");
        }
        while (str == null);
        localStringTokenizer = new StringTokenizer(str);
      }
    while (!localStringTokenizer.nextToken().equalsIgnoreCase(paramString));
    return true;
  }

  public boolean supportsExtension(String paramString)
  {
    return (this.extMap != null) && (this.extMap.get(paramString.toUpperCase(Locale.ENGLISH)) != null);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.smtp.SMTPTransport
 * JD-Core Version:    0.6.2
 */