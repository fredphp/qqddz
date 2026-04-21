package com.sun.mail.smtp;

import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.BASE64DecoderStream;
import com.sun.mail.util.BASE64EncoderStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.StreamTokenizer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Hashtable;
import java.util.StringTokenizer;

public class DigestMD5
{
  private static char[] digits = { 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102 };
  private String clientResponse;
  private PrintStream debugout;
  private MessageDigest md5;
  private String uri;

  public DigestMD5(PrintStream paramPrintStream)
  {
    this.debugout = paramPrintStream;
    if (paramPrintStream != null)
      paramPrintStream.println("DEBUG DIGEST-MD5: Loaded");
  }

  private static String toHex(byte[] paramArrayOfByte)
  {
    char[] arrayOfChar = new char[2 * paramArrayOfByte.length];
    int i = 0;
    int j = 0;
    while (true)
    {
      if (i >= paramArrayOfByte.length)
        return new String(arrayOfChar);
      int k = 0xFF & paramArrayOfByte[i];
      int m = j + 1;
      arrayOfChar[j] = digits[(k >> 4)];
      j = m + 1;
      arrayOfChar[m] = digits[(k & 0xF)];
      i++;
    }
  }

  private Hashtable tokenize(String paramString)
    throws IOException
  {
    Hashtable localHashtable = new Hashtable();
    byte[] arrayOfByte = paramString.getBytes();
    String str = null;
    StreamTokenizer localStreamTokenizer = new StreamTokenizer(new InputStreamReader(new BASE64DecoderStream(new ByteArrayInputStream(arrayOfByte, 4, -4 + arrayOfByte.length))));
    localStreamTokenizer.ordinaryChars(48, 57);
    localStreamTokenizer.wordChars(48, 57);
    while (true)
    {
      int i = localStreamTokenizer.nextToken();
      if (i == -1)
        return localHashtable;
      switch (i)
      {
      default:
        break;
      case -3:
        if (str != null)
          break label134;
        str = localStreamTokenizer.sval;
      case 34:
      }
    }
    label134: if (this.debugout != null)
      this.debugout.println("DEBUG DIGEST-MD5: Received => " + str + "='" + localStreamTokenizer.sval + "'");
    if (localHashtable.containsKey(str))
      localHashtable.put(str, localHashtable.get(str) + "," + localStreamTokenizer.sval);
    while (true)
    {
      str = null;
      break;
      localHashtable.put(str, localStreamTokenizer.sval);
    }
  }

  public byte[] authClient(String paramString1, String paramString2, String paramString3, String paramString4, String paramString5)
    throws IOException
  {
    ByteArrayOutputStream localByteArrayOutputStream = new ByteArrayOutputStream();
    BASE64EncoderStream localBASE64EncoderStream = new BASE64EncoderStream(localByteArrayOutputStream, 2147483647);
    while (true)
    {
      try
      {
        SecureRandom localSecureRandom = new SecureRandom();
        this.md5 = MessageDigest.getInstance("MD5");
        StringBuffer localStringBuffer = new StringBuffer();
        this.uri = ("smtp/" + paramString1);
        byte[] arrayOfByte = new byte[32];
        if (this.debugout != null)
          this.debugout.println("DEBUG DIGEST-MD5: Begin authentication ...");
        Hashtable localHashtable = tokenize(paramString5);
        if (paramString4 == null)
        {
          String str3 = (String)localHashtable.get("realm");
          if (str3 != null)
            paramString4 = new StringTokenizer(str3, ",").nextToken();
        }
        else
        {
          String str1 = (String)localHashtable.get("nonce");
          localSecureRandom.nextBytes(arrayOfByte);
          localBASE64EncoderStream.write(arrayOfByte);
          localBASE64EncoderStream.flush();
          String str2 = localByteArrayOutputStream.toString();
          localByteArrayOutputStream.reset();
          this.md5.update(this.md5.digest(ASCIIUtility.getBytes(paramString2 + ":" + paramString4 + ":" + paramString3)));
          this.md5.update(ASCIIUtility.getBytes(":" + str1 + ":" + str2));
          this.clientResponse = (toHex(this.md5.digest()) + ":" + str1 + ":" + "00000001" + ":" + str2 + ":" + "auth" + ":");
          this.md5.update(ASCIIUtility.getBytes("AUTHENTICATE:" + this.uri));
          this.md5.update(ASCIIUtility.getBytes(this.clientResponse + toHex(this.md5.digest())));
          localStringBuffer.append("username=\"" + paramString2 + "\"");
          localStringBuffer.append(",realm=\"" + paramString4 + "\"");
          localStringBuffer.append(",qop=" + "auth");
          localStringBuffer.append(",nc=" + "00000001");
          localStringBuffer.append(",nonce=\"" + str1 + "\"");
          localStringBuffer.append(",cnonce=\"" + str2 + "\"");
          localStringBuffer.append(",digest-uri=\"" + this.uri + "\"");
          localStringBuffer.append(",response=" + toHex(this.md5.digest()));
          if (this.debugout != null)
            this.debugout.println("DEBUG DIGEST-MD5: Response => " + localStringBuffer.toString());
          localBASE64EncoderStream.write(ASCIIUtility.getBytes(localStringBuffer.toString()));
          localBASE64EncoderStream.flush();
          return localByteArrayOutputStream.toByteArray();
        }
      }
      catch (NoSuchAlgorithmException localNoSuchAlgorithmException)
      {
        if (this.debugout != null)
          this.debugout.println("DEBUG DIGEST-MD5: " + localNoSuchAlgorithmException);
        throw new IOException(localNoSuchAlgorithmException.toString());
      }
      paramString4 = paramString1;
    }
  }

  public boolean authServer(String paramString)
    throws IOException
  {
    Hashtable localHashtable = tokenize(paramString);
    this.md5.update(ASCIIUtility.getBytes(":" + this.uri));
    this.md5.update(ASCIIUtility.getBytes(this.clientResponse + toHex(this.md5.digest())));
    String str = toHex(this.md5.digest());
    if (!str.equals((String)localHashtable.get("rspauth")))
    {
      if (this.debugout != null)
        this.debugout.println("DEBUG DIGEST-MD5: Expected => rspauth=" + str);
      return false;
    }
    return true;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.smtp.DigestMD5
 * JD-Core Version:    0.6.2
 */