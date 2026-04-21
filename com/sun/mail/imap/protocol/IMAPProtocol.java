package com.sun.mail.imap.protocol;

import com.sun.mail.iap.Argument;
import com.sun.mail.iap.BadCommandException;
import com.sun.mail.iap.ByteArray;
import com.sun.mail.iap.CommandFailedException;
import com.sun.mail.iap.ConnectionException;
import com.sun.mail.iap.Literal;
import com.sun.mail.iap.LiteralException;
import com.sun.mail.iap.ParsingException;
import com.sun.mail.iap.Protocol;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import com.sun.mail.imap.ACL;
import com.sun.mail.imap.AppendUID;
import com.sun.mail.imap.Rights;
import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.BASE64EncoderStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Vector;
import javax.mail.Flags;
import javax.mail.Flags.Flag;
import javax.mail.Quota;
import javax.mail.Quota.Resource;
import javax.mail.internet.MimeUtility;
import javax.mail.search.SearchException;
import javax.mail.search.SearchTerm;

public class IMAPProtocol extends Protocol
{
  private static final byte[] CRLF = { 13, 10 };
  private static final byte[] DONE = { 68, 79, 78, 69, 13, 10 };
  private boolean authenticated;
  private List authmechs = null;
  private ByteArray ba;
  private Map capabilities = null;
  private boolean connected = false;
  private String idleTag;
  private String name;
  private boolean rev1 = false;
  private SaslAuthenticator saslAuthenticator;
  private String[] searchCharsets;

  public IMAPProtocol(String paramString1, String paramString2, int paramInt, boolean paramBoolean1, PrintStream paramPrintStream, Properties paramProperties, boolean paramBoolean2)
    throws IOException, ProtocolException
  {
    super(paramString2, paramInt, paramBoolean1, paramPrintStream, paramProperties, "mail." + paramString1, paramBoolean2);
    try
    {
      this.name = paramString1;
      if (this.capabilities == null)
        capability();
      if (hasCapability("IMAP4rev1"))
        this.rev1 = true;
      this.searchCharsets = new String[2];
      this.searchCharsets[0] = "UTF-8";
      this.searchCharsets[1] = MimeUtility.mimeCharset(MimeUtility.getDefaultJavaCharset());
      this.connected = true;
      return;
    }
    finally
    {
      if (!this.connected)
        disconnect();
    }
  }

  private void copy(String paramString1, String paramString2)
    throws ProtocolException
  {
    String str = BASE64MailboxEncoder.encode(paramString2);
    Argument localArgument = new Argument();
    localArgument.writeAtom(paramString1);
    localArgument.writeString(str);
    simpleCommand("COPY", localArgument);
  }

  private String createFlagList(Flags paramFlags)
  {
    StringBuffer localStringBuffer = new StringBuffer();
    localStringBuffer.append("(");
    Flags.Flag[] arrayOfFlag = paramFlags.getSystemFlags();
    int i = 1;
    int j = 0;
    String[] arrayOfString;
    int k;
    if (j >= arrayOfFlag.length)
    {
      arrayOfString = paramFlags.getUserFlags();
      k = 0;
      if (k >= arrayOfString.length)
      {
        localStringBuffer.append(")");
        return localStringBuffer.toString();
      }
    }
    else
    {
      Flags.Flag localFlag = arrayOfFlag[j];
      String str;
      if (localFlag == Flags.Flag.ANSWERED)
      {
        str = "\\Answered";
        label83: if (i == 0)
          break label179;
        i = 0;
      }
      while (true)
      {
        localStringBuffer.append(str);
        do
        {
          j++;
          break;
          if (localFlag == Flags.Flag.DELETED)
          {
            str = "\\Deleted";
            break label83;
          }
          if (localFlag == Flags.Flag.DRAFT)
          {
            str = "\\Draft";
            break label83;
          }
          if (localFlag == Flags.Flag.FLAGGED)
          {
            str = "\\Flagged";
            break label83;
          }
          if (localFlag == Flags.Flag.RECENT)
          {
            str = "\\Recent";
            break label83;
          }
        }
        while (localFlag != Flags.Flag.SEEN);
        str = "\\Seen";
        break label83;
        label179: localStringBuffer.append(' ');
      }
    }
    if (i != 0)
      i = 0;
    while (true)
    {
      localStringBuffer.append(arrayOfString[k]);
      k++;
      break;
      localStringBuffer.append(' ');
    }
  }

  private ListInfo[] doList(String paramString1, String paramString2, String paramString3)
    throws ProtocolException
  {
    String str1 = BASE64MailboxEncoder.encode(paramString2);
    String str2 = BASE64MailboxEncoder.encode(paramString3);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    localArgument.writeString(str2);
    Response[] arrayOfResponse = command(paramString1, localArgument);
    ListInfo[] arrayOfListInfo = (ListInfo[])null;
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    Vector localVector;
    int i;
    if (localResponse.isOK())
    {
      localVector = new Vector(1);
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j)
        break label133;
      if (localVector.size() > 0)
      {
        arrayOfListInfo = new ListInfo[localVector.size()];
        localVector.copyInto(arrayOfListInfo);
      }
    }
    notifyResponseHandlers(arrayOfResponse);
    handleResult(localResponse);
    return arrayOfListInfo;
    label133: if (!(arrayOfResponse[i] instanceof IMAPResponse));
    while (true)
    {
      i++;
      break;
      IMAPResponse localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
      if (localIMAPResponse.keyEquals(paramString1))
      {
        localVector.addElement(new ListInfo(localIMAPResponse));
        arrayOfResponse[i] = null;
      }
    }
  }

  private Response[] fetch(String paramString1, String paramString2, boolean paramBoolean)
    throws ProtocolException
  {
    if (paramBoolean)
      return command("UID FETCH " + paramString1 + " (" + paramString2 + ")", null);
    return command("FETCH " + paramString1 + " (" + paramString2 + ")", null);
  }

  private AppendUID getAppendUID(Response paramResponse)
  {
    if (!paramResponse.isOK());
    int i;
    do
    {
      return null;
      do
        i = paramResponse.readByte();
      while ((i > 0) && (i != 91));
    }
    while ((i == 0) || (!paramResponse.readAtom().equalsIgnoreCase("APPENDUID")));
    return new AppendUID(paramResponse.readLong(), paramResponse.readLong());
  }

  private int[] issueSearch(String paramString1, SearchTerm paramSearchTerm, String paramString2)
    throws ProtocolException, SearchException, IOException
  {
    String str;
    Argument localArgument;
    Response[] arrayOfResponse;
    label36: Response localResponse;
    int[] arrayOfInt;
    Vector localVector;
    int i;
    int m;
    if (paramString2 == null)
    {
      str = null;
      localArgument = SearchSequence.generateSequence(paramSearchTerm, str);
      localArgument.writeAtom(paramString1);
      if (paramString2 != null)
        break label131;
      arrayOfResponse = command("SEARCH", localArgument);
      localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
      arrayOfInt = (int[])null;
      if (localResponse.isOK())
      {
        localVector = new Vector();
        i = 0;
        int j = arrayOfResponse.length;
        if (i < j)
          break label159;
        m = localVector.size();
        arrayOfInt = new int[m];
      }
    }
    for (int n = 0; ; n++)
    {
      if (n >= m)
      {
        notifyResponseHandlers(arrayOfResponse);
        handleResult(localResponse);
        return arrayOfInt;
        str = MimeUtility.javaCharset(paramString2);
        break;
        label131: arrayOfResponse = command("SEARCH CHARSET " + paramString2, localArgument);
        break label36;
        label159: if (!(arrayOfResponse[i] instanceof IMAPResponse));
        IMAPResponse localIMAPResponse;
        do
        {
          i++;
          break;
          localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
        }
        while (!localIMAPResponse.keyEquals("SEARCH"));
        while (true)
        {
          int k = localIMAPResponse.readNumber();
          if (k == -1)
          {
            arrayOfResponse[i] = null;
            break;
          }
          localVector.addElement(new Integer(k));
        }
      }
      arrayOfInt[n] = ((Integer)localVector.elementAt(n)).intValue();
    }
  }

  private Quota parseQuota(Response paramResponse)
    throws ParsingException
  {
    Quota localQuota = new Quota(paramResponse.readAtomString());
    paramResponse.skipSpaces();
    if (paramResponse.readByte() != 40)
      throw new ParsingException("parse error in QUOTA");
    Vector localVector = new Vector();
    while (true)
    {
      if (paramResponse.peekByte() == 41)
      {
        paramResponse.readByte();
        localQuota.resources = new Quota.Resource[localVector.size()];
        localVector.copyInto(localQuota.resources);
        return localQuota;
      }
      String str = paramResponse.readAtom();
      if (str != null)
        localVector.addElement(new Quota.Resource(str, paramResponse.readLong(), paramResponse.readLong()));
    }
  }

  private int[] search(String paramString, SearchTerm paramSearchTerm)
    throws ProtocolException, SearchException
  {
    if (SearchSequence.isAscii(paramSearchTerm))
      try
      {
        int[] arrayOfInt2 = issueSearch(paramString, paramSearchTerm, null);
        return arrayOfInt2;
      }
      catch (IOException localIOException2)
      {
      }
    int i = 0;
    if (i >= this.searchCharsets.length)
      throw new SearchException("Search failed");
    if (this.searchCharsets[i] == null);
    while (true)
    {
      i++;
      break;
      try
      {
        int[] arrayOfInt1 = issueSearch(paramString, paramSearchTerm, this.searchCharsets[i]);
        return arrayOfInt1;
      }
      catch (CommandFailedException localCommandFailedException)
      {
        this.searchCharsets[i] = null;
      }
      catch (IOException localIOException1)
      {
      }
      catch (ProtocolException localProtocolException)
      {
        throw localProtocolException;
      }
      catch (SearchException localSearchException)
      {
        throw localSearchException;
      }
    }
  }

  private void storeFlags(String paramString, Flags paramFlags, boolean paramBoolean)
    throws ProtocolException
  {
    if (paramBoolean);
    for (Response[] arrayOfResponse = command("STORE " + paramString + " +FLAGS " + createFlagList(paramFlags), null); ; arrayOfResponse = command("STORE " + paramString + " -FLAGS " + createFlagList(paramFlags), null))
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
      return;
    }
  }

  public void append(String paramString, Flags paramFlags, Date paramDate, Literal paramLiteral)
    throws ProtocolException
  {
    appenduid(paramString, paramFlags, paramDate, paramLiteral, false);
  }

  public AppendUID appenduid(String paramString, Flags paramFlags, Date paramDate, Literal paramLiteral)
    throws ProtocolException
  {
    return appenduid(paramString, paramFlags, paramDate, paramLiteral, true);
  }

  public AppendUID appenduid(String paramString, Flags paramFlags, Date paramDate, Literal paramLiteral, boolean paramBoolean)
    throws ProtocolException
  {
    String str = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str);
    if (paramFlags != null)
    {
      if (paramFlags.contains(Flags.Flag.RECENT))
      {
        Flags localFlags = new Flags(paramFlags);
        localFlags.remove(Flags.Flag.RECENT);
        paramFlags = localFlags;
      }
      localArgument.writeAtom(createFlagList(paramFlags));
    }
    if (paramDate != null)
      localArgument.writeString(INTERNALDATE.format(paramDate));
    localArgument.writeBytes(paramLiteral);
    Response[] arrayOfResponse = command("APPEND", localArgument);
    notifyResponseHandlers(arrayOfResponse);
    handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
    if (paramBoolean)
      return getAppendUID(arrayOfResponse[(-1 + arrayOfResponse.length)]);
    return null;
  }

  public void authlogin(String paramString1, String paramString2)
    throws ProtocolException
  {
    try
    {
      Vector localVector = new Vector();
      Object localObject1 = null;
      int i = 0;
      try
      {
        String str3 = writeCommand("AUTHENTICATE LOGIN", null);
        str1 = str3;
        localOutputStream = getOutputStream();
        localByteArrayOutputStream = new ByteArrayOutputStream();
        localBASE64EncoderStream = new BASE64EncoderStream(localByteArrayOutputStream, 2147483647);
        j = 1;
        if (i != 0)
        {
          Response[] arrayOfResponse = new Response[localVector.size()];
          localVector.copyInto(arrayOfResponse);
          notifyResponseHandlers(arrayOfResponse);
          handleResult((Response)localObject1);
          setCapabilities((Response)localObject1);
          this.authenticated = true;
          return;
        }
      }
      catch (Exception localException1)
      {
        while (true)
        {
          OutputStream localOutputStream;
          ByteArrayOutputStream localByteArrayOutputStream;
          BASE64EncoderStream localBASE64EncoderStream;
          int j;
          Response localResponse1 = Response.byeResponse(localException1);
          localObject1 = localResponse1;
          i = 1;
          String str1 = null;
          continue;
          while (true)
          {
            try
            {
              localObject1 = readResponse();
              if (!((Response)localObject1).isContinuation())
                break label226;
              if (j == 0)
                break label220;
              str2 = paramString1;
              j = 0;
              localBASE64EncoderStream.write(ASCIIUtility.getBytes(str2));
              localBASE64EncoderStream.flush();
              localByteArrayOutputStream.write(CRLF);
              localOutputStream.write(localByteArrayOutputStream.toByteArray());
              localOutputStream.flush();
              localByteArrayOutputStream.reset();
            }
            catch (Exception localException2)
            {
              Response localResponse2 = Response.byeResponse(localException2);
              localObject1 = localResponse2;
              i = 1;
            }
            break;
            label220: String str2 = paramString2;
          }
          label226: if ((((Response)localObject1).isTagged()) && (((Response)localObject1).getTag().equals(str1)))
            i = 1;
          else if (((Response)localObject1).isBYE())
            i = 1;
          else
            localVector.addElement(localObject1);
        }
      }
    }
    finally
    {
    }
  }

  public void authplain(String paramString1, String paramString2, String paramString3)
    throws ProtocolException
  {
    try
    {
      Vector localVector = new Vector();
      Object localObject1 = null;
      int i = 0;
      try
      {
        String str2 = writeCommand("AUTHENTICATE PLAIN", null);
        str1 = str2;
        localOutputStream = getOutputStream();
        localByteArrayOutputStream = new ByteArrayOutputStream();
        localBASE64EncoderStream = new BASE64EncoderStream(localByteArrayOutputStream, 2147483647);
        if (i != 0)
        {
          Response[] arrayOfResponse = new Response[localVector.size()];
          localVector.copyInto(arrayOfResponse);
          notifyResponseHandlers(arrayOfResponse);
          handleResult((Response)localObject1);
          setCapabilities((Response)localObject1);
          this.authenticated = true;
          return;
        }
      }
      catch (Exception localException1)
      {
        while (true)
        {
          OutputStream localOutputStream;
          ByteArrayOutputStream localByteArrayOutputStream;
          BASE64EncoderStream localBASE64EncoderStream;
          Response localResponse1 = Response.byeResponse(localException1);
          localObject1 = localResponse1;
          i = 1;
          String str1 = null;
          continue;
          try
          {
            localObject1 = readResponse();
            if (!((Response)localObject1).isContinuation())
              break label241;
            localBASE64EncoderStream.write(ASCIIUtility.getBytes(paramString1 + "" + paramString2 + "" + paramString3));
            localBASE64EncoderStream.flush();
            localByteArrayOutputStream.write(CRLF);
            localOutputStream.write(localByteArrayOutputStream.toByteArray());
            localOutputStream.flush();
            localByteArrayOutputStream.reset();
          }
          catch (Exception localException2)
          {
            Response localResponse2 = Response.byeResponse(localException2);
            localObject1 = localResponse2;
            i = 1;
          }
          continue;
          label241: if ((((Response)localObject1).isTagged()) && (((Response)localObject1).getTag().equals(str1)))
            i = 1;
          else if (((Response)localObject1).isBYE())
            i = 1;
          else
            localVector.addElement(localObject1);
        }
      }
    }
    finally
    {
    }
  }

  public void capability()
    throws ProtocolException
  {
    Response[] arrayOfResponse = command("CAPABILITY", null);
    if (!arrayOfResponse[(-1 + arrayOfResponse.length)].isOK())
      throw new ProtocolException(arrayOfResponse[(-1 + arrayOfResponse.length)].toString());
    this.capabilities = new HashMap(10);
    this.authmechs = new ArrayList(5);
    int i = 0;
    int j = arrayOfResponse.length;
    if (i >= j)
      return;
    if (!(arrayOfResponse[i] instanceof IMAPResponse));
    while (true)
    {
      i++;
      break;
      IMAPResponse localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
      if (localIMAPResponse.keyEquals("CAPABILITY"))
        parseCapabilities(localIMAPResponse);
    }
  }

  public void check()
    throws ProtocolException
  {
    simpleCommand("CHECK", null);
  }

  public void close()
    throws ProtocolException
  {
    simpleCommand("CLOSE", null);
  }

  public void copy(int paramInt1, int paramInt2, String paramString)
    throws ProtocolException
  {
    copy(String.valueOf(paramInt1) + ":" + String.valueOf(paramInt2), paramString);
  }

  public void copy(MessageSet[] paramArrayOfMessageSet, String paramString)
    throws ProtocolException
  {
    copy(MessageSet.toString(paramArrayOfMessageSet), paramString);
  }

  public void create(String paramString)
    throws ProtocolException
  {
    String str = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str);
    simpleCommand("CREATE", localArgument);
  }

  public void delete(String paramString)
    throws ProtocolException
  {
    String str = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str);
    simpleCommand("DELETE", localArgument);
  }

  public void deleteACL(String paramString1, String paramString2)
    throws ProtocolException
  {
    if (!hasCapability("ACL"))
      throw new BadCommandException("ACL not supported");
    String str = BASE64MailboxEncoder.encode(paramString1);
    Argument localArgument = new Argument();
    localArgument.writeString(str);
    localArgument.writeString(paramString2);
    Response[] arrayOfResponse = command("DELETEACL", localArgument);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    notifyResponseHandlers(arrayOfResponse);
    handleResult(localResponse);
  }

  public void disconnect()
  {
    super.disconnect();
    this.authenticated = false;
  }

  public MailboxInfo examine(String paramString)
    throws ProtocolException
  {
    String str = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str);
    Response[] arrayOfResponse = command("EXAMINE", localArgument);
    MailboxInfo localMailboxInfo = new MailboxInfo(arrayOfResponse);
    localMailboxInfo.mode = 1;
    notifyResponseHandlers(arrayOfResponse);
    handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
    return localMailboxInfo;
  }

  public void expunge()
    throws ProtocolException
  {
    simpleCommand("EXPUNGE", null);
  }

  public Response[] fetch(int paramInt1, int paramInt2, String paramString)
    throws ProtocolException
  {
    return fetch(String.valueOf(paramInt1) + ":" + String.valueOf(paramInt2), paramString, false);
  }

  public Response[] fetch(int paramInt, String paramString)
    throws ProtocolException
  {
    return fetch(String.valueOf(paramInt), paramString, false);
  }

  public Response[] fetch(MessageSet[] paramArrayOfMessageSet, String paramString)
    throws ProtocolException
  {
    return fetch(MessageSet.toString(paramArrayOfMessageSet), paramString, false);
  }

  public BODY fetchBody(int paramInt, String paramString)
    throws ProtocolException
  {
    return fetchBody(paramInt, paramString, false);
  }

  public BODY fetchBody(int paramInt1, String paramString, int paramInt2, int paramInt3)
    throws ProtocolException
  {
    return fetchBody(paramInt1, paramString, paramInt2, paramInt3, false, null);
  }

  public BODY fetchBody(int paramInt1, String paramString, int paramInt2, int paramInt3, ByteArray paramByteArray)
    throws ProtocolException
  {
    return fetchBody(paramInt1, paramString, paramInt2, paramInt3, false, paramByteArray);
  }

  protected BODY fetchBody(int paramInt1, String paramString, int paramInt2, int paramInt3, boolean paramBoolean, ByteArray paramByteArray)
    throws ProtocolException
  {
    this.ba = paramByteArray;
    String str1;
    StringBuilder localStringBuilder;
    if (paramBoolean)
    {
      str1 = "BODY.PEEK[";
      localStringBuilder = new StringBuilder(String.valueOf(str1));
      if (paramString != null)
        break label128;
    }
    Response localResponse;
    label128: for (String str2 = "]<"; ; str2 = paramString + "]<")
    {
      Response[] arrayOfResponse = fetch(paramInt1, str2 + String.valueOf(paramInt2) + "." + String.valueOf(paramInt3) + ">");
      notifyResponseHandlers(arrayOfResponse);
      localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
      if (!localResponse.isOK())
        break label153;
      return (BODY)FetchResponse.getItem(arrayOfResponse, paramInt1, BODY.class);
      str1 = "BODY[";
      break;
    }
    label153: if (localResponse.isNO())
      return null;
    handleResult(localResponse);
    return null;
  }

  protected BODY fetchBody(int paramInt, String paramString, boolean paramBoolean)
    throws ProtocolException
  {
    Response[] arrayOfResponse;
    Response localResponse;
    if (paramBoolean)
    {
      StringBuilder localStringBuilder1 = new StringBuilder("BODY.PEEK[");
      if (paramString == null);
      for (String str1 = "]"; ; str1 = paramString + "]")
      {
        arrayOfResponse = fetch(paramInt, str1);
        notifyResponseHandlers(arrayOfResponse);
        localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
        if (!localResponse.isOK())
          break;
        return (BODY)FetchResponse.getItem(arrayOfResponse, paramInt, BODY.class);
      }
    }
    StringBuilder localStringBuilder2 = new StringBuilder("BODY[");
    if (paramString == null);
    for (String str2 = "]"; ; str2 = paramString + "]")
    {
      arrayOfResponse = fetch(paramInt, str2);
      break;
    }
    if (localResponse.isNO())
      return null;
    handleResult(localResponse);
    return null;
  }

  public BODYSTRUCTURE fetchBodyStructure(int paramInt)
    throws ProtocolException
  {
    Response[] arrayOfResponse = fetch(paramInt, "BODYSTRUCTURE");
    notifyResponseHandlers(arrayOfResponse);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    BODYSTRUCTURE localBODYSTRUCTURE;
    if (localResponse.isOK())
      localBODYSTRUCTURE = (BODYSTRUCTURE)FetchResponse.getItem(arrayOfResponse, paramInt, BODYSTRUCTURE.class);
    boolean bool;
    do
    {
      return localBODYSTRUCTURE;
      bool = localResponse.isNO();
      localBODYSTRUCTURE = null;
    }
    while (bool);
    handleResult(localResponse);
    return null;
  }

  public Flags fetchFlags(int paramInt)
    throws ProtocolException
  {
    Flags localFlags = null;
    Response[] arrayOfResponse = fetch(paramInt, "FLAGS");
    int i = 0;
    int j = arrayOfResponse.length;
    if (i >= j);
    while (true)
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
      return localFlags;
      if ((arrayOfResponse[i] == null) || (!(arrayOfResponse[i] instanceof FetchResponse)) || (((FetchResponse)arrayOfResponse[i]).getNumber() != paramInt));
      do
      {
        i++;
        break;
        localFlags = (Flags)((FetchResponse)arrayOfResponse[i]).getItem(Flags.class);
      }
      while (localFlags == null);
      arrayOfResponse[i] = null;
    }
  }

  public RFC822DATA fetchRFC822(int paramInt, String paramString)
    throws ProtocolException
  {
    if (paramString == null);
    Response localResponse;
    for (String str = "RFC822"; ; str = "RFC822." + paramString)
    {
      Response[] arrayOfResponse = fetch(paramInt, str);
      notifyResponseHandlers(arrayOfResponse);
      localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
      if (!localResponse.isOK())
        break;
      return (RFC822DATA)FetchResponse.getItem(arrayOfResponse, paramInt, RFC822DATA.class);
    }
    if (localResponse.isNO())
      return null;
    handleResult(localResponse);
    return null;
  }

  public UID fetchSequenceNumber(long paramLong)
    throws ProtocolException
  {
    UID localUID = null;
    Response[] arrayOfResponse = fetch(String.valueOf(paramLong), "UID", true);
    int i = 0;
    int j = arrayOfResponse.length;
    if (i >= j)
    {
      label31: notifyResponseHandlers(arrayOfResponse);
      handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
      return localUID;
    }
    if ((arrayOfResponse[i] == null) || (!(arrayOfResponse[i] instanceof FetchResponse)));
    while (true)
    {
      i++;
      break;
      localUID = (UID)((FetchResponse)arrayOfResponse[i]).getItem(UID.class);
      if (localUID != null)
      {
        if (localUID.uid == paramLong)
          break label31;
        localUID = null;
      }
    }
  }

  public UID[] fetchSequenceNumbers(long paramLong1, long paramLong2)
    throws ProtocolException
  {
    StringBuilder localStringBuilder = new StringBuilder(String.valueOf(String.valueOf(paramLong1))).append(":");
    if (paramLong2 == -1L);
    Response[] arrayOfResponse;
    Vector localVector;
    int i;
    for (String str = "*"; ; str = String.valueOf(paramLong2))
    {
      arrayOfResponse = fetch(str, "UID", true);
      localVector = new Vector();
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j)
        break;
      notifyResponseHandlers(arrayOfResponse);
      handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
      UID[] arrayOfUID = new UID[localVector.size()];
      localVector.copyInto(arrayOfUID);
      return arrayOfUID;
    }
    if ((arrayOfResponse[i] == null) || (!(arrayOfResponse[i] instanceof FetchResponse)));
    while (true)
    {
      i++;
      break;
      UID localUID = (UID)((FetchResponse)arrayOfResponse[i]).getItem(UID.class);
      if (localUID != null)
        localVector.addElement(localUID);
    }
  }

  public UID[] fetchSequenceNumbers(long[] paramArrayOfLong)
    throws ProtocolException
  {
    StringBuffer localStringBuffer = new StringBuffer();
    Response[] arrayOfResponse;
    Vector localVector;
    int j;
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfLong.length)
      {
        arrayOfResponse = fetch(localStringBuffer.toString(), "UID", true);
        localVector = new Vector();
        j = 0;
        int k = arrayOfResponse.length;
        if (j < k)
          break;
        notifyResponseHandlers(arrayOfResponse);
        handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
        UID[] arrayOfUID = new UID[localVector.size()];
        localVector.copyInto(arrayOfUID);
        return arrayOfUID;
      }
      if (i > 0)
        localStringBuffer.append(",");
      localStringBuffer.append(String.valueOf(paramArrayOfLong[i]));
    }
    if ((arrayOfResponse[j] == null) || (!(arrayOfResponse[j] instanceof FetchResponse)));
    while (true)
    {
      j++;
      break;
      UID localUID = (UID)((FetchResponse)arrayOfResponse[j]).getItem(UID.class);
      if (localUID != null)
        localVector.addElement(localUID);
    }
  }

  public UID fetchUID(int paramInt)
    throws ProtocolException
  {
    Response[] arrayOfResponse = fetch(paramInt, "UID");
    notifyResponseHandlers(arrayOfResponse);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    UID localUID;
    if (localResponse.isOK())
      localUID = (UID)FetchResponse.getItem(arrayOfResponse, paramInt, UID.class);
    boolean bool;
    do
    {
      return localUID;
      bool = localResponse.isNO();
      localUID = null;
    }
    while (bool);
    handleResult(localResponse);
    return null;
  }

  public ACL[] getACL(String paramString)
    throws ProtocolException
  {
    if (!hasCapability("ACL"))
      throw new BadCommandException("ACL not supported");
    String str1 = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    Response[] arrayOfResponse = command("GETACL", localArgument);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    Vector localVector = new Vector();
    int i;
    if (localResponse.isOK())
    {
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j);
    }
    else
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(localResponse);
      ACL[] arrayOfACL = new ACL[localVector.size()];
      localVector.copyInto(arrayOfACL);
      return arrayOfACL;
    }
    if (!(arrayOfResponse[i] instanceof IMAPResponse));
    IMAPResponse localIMAPResponse;
    do
    {
      i++;
      break;
      localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
    }
    while (!localIMAPResponse.keyEquals("ACL"));
    localIMAPResponse.readAtomString();
    while (true)
    {
      String str2 = localIMAPResponse.readAtomString();
      if (str2 == null);
      String str3;
      do
      {
        arrayOfResponse[i] = null;
        break;
        str3 = localIMAPResponse.readAtomString();
      }
      while (str3 == null);
      localVector.addElement(new ACL(str2, new Rights(str3)));
    }
  }

  public Map getCapabilities()
  {
    return this.capabilities;
  }

  OutputStream getIMAPOutputStream()
  {
    return getOutputStream();
  }

  public Quota[] getQuota(String paramString)
    throws ProtocolException
  {
    if (!hasCapability("QUOTA"))
      throw new BadCommandException("QUOTA not supported");
    Argument localArgument = new Argument();
    localArgument.writeString(paramString);
    Response[] arrayOfResponse = command("GETQUOTA", localArgument);
    Vector localVector = new Vector();
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    int i;
    if (localResponse.isOK())
    {
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j);
    }
    else
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(localResponse);
      Quota[] arrayOfQuota = new Quota[localVector.size()];
      localVector.copyInto(arrayOfQuota);
      return arrayOfQuota;
    }
    if (!(arrayOfResponse[i] instanceof IMAPResponse));
    while (true)
    {
      i++;
      break;
      IMAPResponse localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
      if (localIMAPResponse.keyEquals("QUOTA"))
      {
        localVector.addElement(parseQuota(localIMAPResponse));
        arrayOfResponse[i] = null;
      }
    }
  }

  public Quota[] getQuotaRoot(String paramString)
    throws ProtocolException
  {
    if (!hasCapability("QUOTA"))
      throw new BadCommandException("GETQUOTAROOT not supported");
    String str1 = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    Response[] arrayOfResponse = command("GETQUOTAROOT", localArgument);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    Hashtable localHashtable = new Hashtable();
    int j;
    Quota[] arrayOfQuota;
    Enumeration localEnumeration;
    if (localResponse.isOK())
    {
      j = 0;
      int k = arrayOfResponse.length;
      if (j < k);
    }
    else
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(localResponse);
      arrayOfQuota = new Quota[localHashtable.size()];
      localEnumeration = localHashtable.elements();
    }
    for (int i = 0; ; i++)
    {
      if (!localEnumeration.hasMoreElements())
      {
        return arrayOfQuota;
        if (!(arrayOfResponse[j] instanceof IMAPResponse));
        while (true)
        {
          j++;
          break;
          IMAPResponse localIMAPResponse = (IMAPResponse)arrayOfResponse[j];
          if (localIMAPResponse.keyEquals("QUOTAROOT"))
          {
            localIMAPResponse.readAtomString();
            while (true)
            {
              String str2 = localIMAPResponse.readAtomString();
              if (str2 == null)
              {
                arrayOfResponse[j] = null;
                break;
              }
              localHashtable.put(str2, new Quota(str2));
            }
          }
          if (localIMAPResponse.keyEquals("QUOTA"))
          {
            Quota localQuota1 = parseQuota(localIMAPResponse);
            Quota localQuota2 = (Quota)localHashtable.get(localQuota1.quotaRoot);
            if (localQuota2 != null);
            localHashtable.put(localQuota1.quotaRoot, localQuota1);
            arrayOfResponse[j] = null;
          }
        }
      }
      arrayOfQuota[i] = ((Quota)localEnumeration.nextElement());
    }
  }

  protected ByteArray getResponseBuffer()
  {
    ByteArray localByteArray = this.ba;
    this.ba = null;
    return localByteArray;
  }

  public boolean hasCapability(String paramString)
  {
    return this.capabilities.containsKey(paramString.toUpperCase(Locale.ENGLISH));
  }

  public void idleAbort()
    throws ProtocolException
  {
    OutputStream localOutputStream = getOutputStream();
    try
    {
      localOutputStream.write(DONE);
      localOutputStream.flush();
      return;
    }
    catch (IOException localIOException)
    {
    }
  }

  public void idleStart()
    throws ProtocolException
  {
    try
    {
      if (!hasCapability("IDLE"))
        throw new BadCommandException("IDLE not supported");
    }
    finally
    {
    }
    try
    {
      this.idleTag = writeCommand("IDLE", null);
      Response localResponse2 = readResponse();
      localObject2 = localResponse2;
      if (!((Response)localObject2).isContinuation())
        handleResult((Response)localObject2);
      return;
    }
    catch (LiteralException localLiteralException)
    {
      while (true)
        localObject2 = localLiteralException.getResponse();
    }
    catch (Exception localException)
    {
      while (true)
      {
        Response localResponse1 = Response.byeResponse(localException);
        Object localObject2 = localResponse1;
      }
    }
  }

  public boolean isAuthenticated()
  {
    return this.authenticated;
  }

  public boolean isREV1()
  {
    return this.rev1;
  }

  public ListInfo[] list(String paramString1, String paramString2)
    throws ProtocolException
  {
    return doList("LIST", paramString1, paramString2);
  }

  public Rights[] listRights(String paramString1, String paramString2)
    throws ProtocolException
  {
    if (!hasCapability("ACL"))
      throw new BadCommandException("ACL not supported");
    String str1 = BASE64MailboxEncoder.encode(paramString1);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    localArgument.writeString(paramString2);
    Response[] arrayOfResponse = command("LISTRIGHTS", localArgument);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    Vector localVector = new Vector();
    int i;
    if (localResponse.isOK())
    {
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j);
    }
    else
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(localResponse);
      Rights[] arrayOfRights = new Rights[localVector.size()];
      localVector.copyInto(arrayOfRights);
      return arrayOfRights;
    }
    if (!(arrayOfResponse[i] instanceof IMAPResponse));
    IMAPResponse localIMAPResponse;
    do
    {
      i++;
      break;
      localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
    }
    while (!localIMAPResponse.keyEquals("LISTRIGHTS"));
    localIMAPResponse.readAtomString();
    localIMAPResponse.readAtomString();
    while (true)
    {
      String str2 = localIMAPResponse.readAtomString();
      if (str2 == null)
      {
        arrayOfResponse[i] = null;
        break;
      }
      localVector.addElement(new Rights(str2));
    }
  }

  public void login(String paramString1, String paramString2)
    throws ProtocolException
  {
    Argument localArgument = new Argument();
    localArgument.writeString(paramString1);
    localArgument.writeString(paramString2);
    Response[] arrayOfResponse = command("LOGIN", localArgument);
    notifyResponseHandlers(arrayOfResponse);
    handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
    setCapabilities(arrayOfResponse[(-1 + arrayOfResponse.length)]);
    this.authenticated = true;
  }

  public void logout()
    throws ProtocolException
  {
    Response[] arrayOfResponse = command("LOGOUT", null);
    this.authenticated = false;
    notifyResponseHandlers(arrayOfResponse);
    disconnect();
  }

  public ListInfo[] lsub(String paramString1, String paramString2)
    throws ProtocolException
  {
    return doList("LSUB", paramString1, paramString2);
  }

  public Rights myRights(String paramString)
    throws ProtocolException
  {
    if (!hasCapability("ACL"))
      throw new BadCommandException("ACL not supported");
    String str1 = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    Response[] arrayOfResponse = command("MYRIGHTS", localArgument);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    boolean bool = localResponse.isOK();
    Rights localRights = null;
    int i;
    if (bool)
    {
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j);
    }
    else
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(localResponse);
      return localRights;
    }
    if (!(arrayOfResponse[i] instanceof IMAPResponse));
    while (true)
    {
      i++;
      break;
      IMAPResponse localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
      if (localIMAPResponse.keyEquals("MYRIGHTS"))
      {
        localIMAPResponse.readAtomString();
        String str2 = localIMAPResponse.readAtomString();
        if (localRights == null)
          localRights = new Rights(str2);
        arrayOfResponse[i] = null;
      }
    }
  }

  public Namespaces namespace()
    throws ProtocolException
  {
    if (!hasCapability("NAMESPACE"))
      throw new BadCommandException("NAMESPACE not supported");
    Response[] arrayOfResponse = command("NAMESPACE", null);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    boolean bool = localResponse.isOK();
    Namespaces localNamespaces = null;
    int i;
    if (bool)
    {
      i = 0;
      int j = arrayOfResponse.length;
      if (i < j);
    }
    else
    {
      notifyResponseHandlers(arrayOfResponse);
      handleResult(localResponse);
      return localNamespaces;
    }
    if (!(arrayOfResponse[i] instanceof IMAPResponse));
    while (true)
    {
      i++;
      break;
      IMAPResponse localIMAPResponse = (IMAPResponse)arrayOfResponse[i];
      if (localIMAPResponse.keyEquals("NAMESPACE"))
      {
        if (localNamespaces == null)
          localNamespaces = new Namespaces(localIMAPResponse);
        arrayOfResponse[i] = null;
      }
    }
  }

  public void noop()
    throws ProtocolException
  {
    if (this.debug)
      this.out.println("IMAP DEBUG: IMAPProtocol noop");
    simpleCommand("NOOP", null);
  }

  protected void parseCapabilities(Response paramResponse)
  {
    while (true)
    {
      String str = paramResponse.readAtom(']');
      if (str == null);
      do
      {
        return;
        if (str.length() != 0)
          break;
      }
      while (paramResponse.peekByte() == 93);
      paramResponse.skipToken();
      continue;
      this.capabilities.put(str.toUpperCase(Locale.ENGLISH), str);
      if (str.regionMatches(true, 0, "AUTH=", 0, 5))
      {
        this.authmechs.add(str.substring(5));
        if (this.debug)
          this.out.println("IMAP DEBUG: AUTH: " + str.substring(5));
      }
    }
  }

  public BODY peekBody(int paramInt, String paramString)
    throws ProtocolException
  {
    return fetchBody(paramInt, paramString, true);
  }

  public BODY peekBody(int paramInt1, String paramString, int paramInt2, int paramInt3)
    throws ProtocolException
  {
    return fetchBody(paramInt1, paramString, paramInt2, paramInt3, true, null);
  }

  public BODY peekBody(int paramInt1, String paramString, int paramInt2, int paramInt3, ByteArray paramByteArray)
    throws ProtocolException
  {
    return fetchBody(paramInt1, paramString, paramInt2, paramInt3, true, paramByteArray);
  }

  protected void processGreeting(Response paramResponse)
    throws ProtocolException
  {
    super.processGreeting(paramResponse);
    if (paramResponse.isOK())
    {
      setCapabilities(paramResponse);
      return;
    }
    if (((IMAPResponse)paramResponse).keyEquals("PREAUTH"))
    {
      this.authenticated = true;
      setCapabilities(paramResponse);
      return;
    }
    throw new ConnectionException(this, paramResponse);
  }

  public boolean processIdleResponse(Response paramResponse)
    throws ProtocolException
  {
    notifyResponseHandlers(new Response[] { paramResponse });
    boolean bool = paramResponse.isBYE();
    int i = 0;
    if (bool)
      i = 1;
    if ((paramResponse.isTagged()) && (paramResponse.getTag().equals(this.idleTag)))
      i = 1;
    if (i != 0)
      this.idleTag = null;
    handleResult(paramResponse);
    return i == 0;
  }

  public void proxyauth(String paramString)
    throws ProtocolException
  {
    Argument localArgument = new Argument();
    localArgument.writeString(paramString);
    simpleCommand("PROXYAUTH", localArgument);
  }

  public Response readIdleResponse()
  {
    try
    {
      String str = this.idleTag;
      Object localObject2;
      if (str == null)
        localObject2 = null;
      while (true)
      {
        return localObject2;
        try
        {
          Response localResponse2 = readResponse();
          localObject2 = localResponse2;
        }
        catch (IOException localIOException)
        {
          localObject2 = Response.byeResponse(localIOException);
        }
        catch (ProtocolException localProtocolException)
        {
          Response localResponse1 = Response.byeResponse(localProtocolException);
          localObject2 = localResponse1;
        }
      }
    }
    finally
    {
    }
  }

  public Response readResponse()
    throws IOException, ProtocolException
  {
    return IMAPResponse.readResponse(this);
  }

  public void rename(String paramString1, String paramString2)
    throws ProtocolException
  {
    String str1 = BASE64MailboxEncoder.encode(paramString1);
    String str2 = BASE64MailboxEncoder.encode(paramString2);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    localArgument.writeString(str2);
    simpleCommand("RENAME", localArgument);
  }

  public void sasllogin(String[] paramArrayOfString, String paramString1, String paramString2, String paramString3, String paramString4)
    throws ProtocolException
  {
    if (this.saslAuthenticator == null);
    while (true)
    {
      int i;
      try
      {
        Class localClass = Class.forName("com.sun.mail.imap.protocol.IMAPSaslAuthenticator");
        Class[] arrayOfClass = new Class[6];
        arrayOfClass[0] = IMAPProtocol.class;
        arrayOfClass[1] = String.class;
        arrayOfClass[2] = Properties.class;
        arrayOfClass[3] = Boolean.TYPE;
        arrayOfClass[4] = PrintStream.class;
        arrayOfClass[5] = String.class;
        Constructor localConstructor = localClass.getConstructor(arrayOfClass);
        Object[] arrayOfObject = new Object[6];
        arrayOfObject[0] = this;
        arrayOfObject[1] = this.name;
        arrayOfObject[2] = this.props;
        Boolean localBoolean;
        if (this.debug)
        {
          localBoolean = Boolean.TRUE;
          arrayOfObject[3] = localBoolean;
          arrayOfObject[4] = this.out;
          arrayOfObject[5] = this.host;
          this.saslAuthenticator = ((SaslAuthenticator)localConstructor.newInstance(arrayOfObject));
          if ((paramArrayOfString == null) || (paramArrayOfString.length <= 0))
            break label301;
          localObject = new ArrayList(paramArrayOfString.length);
          i = 0;
          if (i >= paramArrayOfString.length)
          {
            String[] arrayOfString = (String[])((List)localObject).toArray(new String[((List)localObject).size()]);
            if (this.saslAuthenticator.authenticate(arrayOfString, paramString1, paramString2, paramString3, paramString4))
              this.authenticated = true;
          }
        }
        else
        {
          localBoolean = Boolean.FALSE;
          continue;
        }
      }
      catch (Exception localException)
      {
        if (!this.debug)
          continue;
        this.out.println("IMAP DEBUG: Can't load SASL authenticator: " + localException);
        return;
      }
      if (this.authmechs.contains(paramArrayOfString[i]))
        ((List)localObject).add(paramArrayOfString[i]);
      i++;
      continue;
      label301: Object localObject = this.authmechs;
    }
  }

  public int[] search(SearchTerm paramSearchTerm)
    throws ProtocolException, SearchException
  {
    return search("ALL", paramSearchTerm);
  }

  public int[] search(MessageSet[] paramArrayOfMessageSet, SearchTerm paramSearchTerm)
    throws ProtocolException, SearchException
  {
    return search(MessageSet.toString(paramArrayOfMessageSet), paramSearchTerm);
  }

  public MailboxInfo select(String paramString)
    throws ProtocolException
  {
    String str = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str);
    Response[] arrayOfResponse = command("SELECT", localArgument);
    MailboxInfo localMailboxInfo = new MailboxInfo(arrayOfResponse);
    notifyResponseHandlers(arrayOfResponse);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    if (localResponse.isOK())
      if (localResponse.toString().indexOf("READ-ONLY") == -1)
        break label93;
    label93: for (localMailboxInfo.mode = 1; ; localMailboxInfo.mode = 2)
    {
      handleResult(localResponse);
      return localMailboxInfo;
    }
  }

  public void setACL(String paramString, char paramChar, ACL paramACL)
    throws ProtocolException
  {
    if (!hasCapability("ACL"))
      throw new BadCommandException("ACL not supported");
    String str1 = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument = new Argument();
    localArgument.writeString(str1);
    localArgument.writeString(paramACL.getName());
    String str2 = paramACL.getRights().toString();
    if ((paramChar == '+') || (paramChar == '-'))
      str2 = paramChar + str2;
    localArgument.writeString(str2);
    Response[] arrayOfResponse = command("SETACL", localArgument);
    Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
    notifyResponseHandlers(arrayOfResponse);
    handleResult(localResponse);
  }

  protected void setCapabilities(Response paramResponse)
  {
    int i;
    do
      i = paramResponse.readByte();
    while ((i > 0) && (i != 91));
    if (i == 0);
    while (!paramResponse.readAtom().equalsIgnoreCase("CAPABILITY"))
      return;
    this.capabilities = new HashMap(10);
    this.authmechs = new ArrayList(5);
    parseCapabilities(paramResponse);
  }

  public void setQuota(Quota paramQuota)
    throws ProtocolException
  {
    if (!hasCapability("QUOTA"))
      throw new BadCommandException("QUOTA not supported");
    Argument localArgument1 = new Argument();
    localArgument1.writeString(paramQuota.quotaRoot);
    Argument localArgument2 = new Argument();
    if (paramQuota.resources != null);
    for (int i = 0; ; i++)
    {
      if (i >= paramQuota.resources.length)
      {
        localArgument1.writeArgument(localArgument2);
        Response[] arrayOfResponse = command("SETQUOTA", localArgument1);
        Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
        notifyResponseHandlers(arrayOfResponse);
        handleResult(localResponse);
        return;
      }
      localArgument2.writeAtom(paramQuota.resources[i].name);
      localArgument2.writeNumber(paramQuota.resources[i].limit);
    }
  }

  public void startTLS()
    throws ProtocolException
  {
    try
    {
      super.startTLS("STARTTLS");
      return;
    }
    catch (ProtocolException localProtocolException)
    {
      throw localProtocolException;
    }
    catch (Exception localException)
    {
      Response[] arrayOfResponse = new Response[1];
      arrayOfResponse[0] = Response.byeResponse(localException);
      notifyResponseHandlers(arrayOfResponse);
      disconnect();
    }
  }

  public Status status(String paramString, String[] paramArrayOfString)
    throws ProtocolException
  {
    if ((!isREV1()) && (!hasCapability("IMAP4SUNVERSION")))
      throw new BadCommandException("STATUS not supported");
    String str = BASE64MailboxEncoder.encode(paramString);
    Argument localArgument1 = new Argument();
    localArgument1.writeString(str);
    Argument localArgument2 = new Argument();
    if (paramArrayOfString == null)
      paramArrayOfString = Status.standardItems;
    int i = 0;
    int j = paramArrayOfString.length;
    Response[] arrayOfResponse;
    Status localStatus;
    int k;
    while (true)
    {
      if (i >= j)
      {
        localArgument1.writeArgument(localArgument2);
        arrayOfResponse = command("STATUS", localArgument1);
        Response localResponse = arrayOfResponse[(-1 + arrayOfResponse.length)];
        boolean bool = localResponse.isOK();
        localStatus = null;
        if (bool)
        {
          k = 0;
          int m = arrayOfResponse.length;
          if (k < m)
            break;
        }
        notifyResponseHandlers(arrayOfResponse);
        handleResult(localResponse);
        return localStatus;
      }
      localArgument2.writeAtom(paramArrayOfString[i]);
      i++;
    }
    if (!(arrayOfResponse[k] instanceof IMAPResponse));
    IMAPResponse localIMAPResponse;
    do
    {
      k++;
      break;
      localIMAPResponse = (IMAPResponse)arrayOfResponse[k];
    }
    while (!localIMAPResponse.keyEquals("STATUS"));
    if (localStatus == null)
      localStatus = new Status(localIMAPResponse);
    while (true)
    {
      arrayOfResponse[k] = null;
      break;
      Status.add(localStatus, new Status(localIMAPResponse));
    }
  }

  public void storeFlags(int paramInt1, int paramInt2, Flags paramFlags, boolean paramBoolean)
    throws ProtocolException
  {
    storeFlags(String.valueOf(paramInt1) + ":" + String.valueOf(paramInt2), paramFlags, paramBoolean);
  }

  public void storeFlags(int paramInt, Flags paramFlags, boolean paramBoolean)
    throws ProtocolException
  {
    storeFlags(String.valueOf(paramInt), paramFlags, paramBoolean);
  }

  public void storeFlags(MessageSet[] paramArrayOfMessageSet, Flags paramFlags, boolean paramBoolean)
    throws ProtocolException
  {
    storeFlags(MessageSet.toString(paramArrayOfMessageSet), paramFlags, paramBoolean);
  }

  public void subscribe(String paramString)
    throws ProtocolException
  {
    Argument localArgument = new Argument();
    localArgument.writeString(BASE64MailboxEncoder.encode(paramString));
    simpleCommand("SUBSCRIBE", localArgument);
  }

  protected boolean supportsNonSyncLiterals()
  {
    return hasCapability("LITERAL+");
  }

  public void uidexpunge(UIDSet[] paramArrayOfUIDSet)
    throws ProtocolException
  {
    if (!hasCapability("UIDPLUS"))
      throw new BadCommandException("UID EXPUNGE not supported");
    simpleCommand("UID EXPUNGE " + UIDSet.toString(paramArrayOfUIDSet), null);
  }

  public void unsubscribe(String paramString)
    throws ProtocolException
  {
    Argument localArgument = new Argument();
    localArgument.writeString(BASE64MailboxEncoder.encode(paramString));
    simpleCommand("UNSUBSCRIBE", localArgument);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.IMAPProtocol
 * JD-Core Version:    0.6.2
 */