package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ByteArray;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.BASE64DecoderStream;
import com.sun.mail.util.BASE64EncoderStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Properties;
import java.util.Vector;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.sasl.RealmCallback;
import javax.security.sasl.RealmChoiceCallback;
import javax.security.sasl.Sasl;
import javax.security.sasl.SaslClient;
import javax.security.sasl.SaslException;

public class IMAPSaslAuthenticator
  implements SaslAuthenticator
{
  private boolean debug;
  private String host;
  private String name;
  private PrintStream out;
  private IMAPProtocol pr;
  private Properties props;

  public IMAPSaslAuthenticator(IMAPProtocol paramIMAPProtocol, String paramString1, Properties paramProperties, boolean paramBoolean, PrintStream paramPrintStream, String paramString2)
  {
    this.pr = paramIMAPProtocol;
    this.name = paramString1;
    this.props = paramProperties;
    this.debug = paramBoolean;
    this.out = paramPrintStream;
    this.host = paramString2;
  }

  public boolean authenticate(String[] paramArrayOfString, final String paramString1, String paramString2, final String paramString3, final String paramString4)
    throws ProtocolException
  {
    Vector localVector;
    Object localObject1;
    while (true)
    {
      int i;
      String str1;
      synchronized (this.pr)
      {
        localVector = new Vector();
        localObject1 = null;
        i = 0;
        int j;
        CallbackHandler local1;
        if (this.debug)
        {
          this.out.print("IMAP SASL DEBUG: Mechanisms:");
          j = 0;
          if (j >= paramArrayOfString.length)
            this.out.println();
        }
        else
        {
          local1 = new CallbackHandler()
          {
            public void handle(Callback[] paramAnonymousArrayOfCallback)
            {
              if (IMAPSaslAuthenticator.this.debug)
                IMAPSaslAuthenticator.this.out.println("IMAP SASL DEBUG: callback length: " + paramAnonymousArrayOfCallback.length);
              int i = 0;
              if (i >= paramAnonymousArrayOfCallback.length)
                return;
              if (IMAPSaslAuthenticator.this.debug)
                IMAPSaslAuthenticator.this.out.println("IMAP SASL DEBUG: callback " + i + ": " + paramAnonymousArrayOfCallback[i]);
              if ((paramAnonymousArrayOfCallback[i] instanceof NameCallback))
                ((NameCallback)paramAnonymousArrayOfCallback[i]).setName(paramString3);
              label278: 
              while (true)
              {
                i++;
                break;
                if ((paramAnonymousArrayOfCallback[i] instanceof PasswordCallback))
                {
                  ((PasswordCallback)paramAnonymousArrayOfCallback[i]).setPassword(paramString4.toCharArray());
                }
                else
                {
                  if ((paramAnonymousArrayOfCallback[i] instanceof RealmCallback))
                  {
                    RealmCallback localRealmCallback = (RealmCallback)paramAnonymousArrayOfCallback[i];
                    if (paramString1 != null);
                    for (String str = paramString1; ; str = localRealmCallback.getDefaultText())
                    {
                      localRealmCallback.setText(str);
                      break;
                    }
                  }
                  if ((paramAnonymousArrayOfCallback[i] instanceof RealmChoiceCallback))
                  {
                    RealmChoiceCallback localRealmChoiceCallback = (RealmChoiceCallback)paramAnonymousArrayOfCallback[i];
                    if (paramString1 == null)
                    {
                      localRealmChoiceCallback.setSelectedIndex(localRealmChoiceCallback.getDefaultChoice());
                    }
                    else
                    {
                      String[] arrayOfString = localRealmChoiceCallback.getChoices();
                      for (int j = 0; ; j++)
                      {
                        if (j >= arrayOfString.length)
                          break label278;
                        if (arrayOfString[j].equals(paramString1))
                        {
                          localRealmChoiceCallback.setSelectedIndex(j);
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
          };
        }
        SaslClient localSaslClient;
        try
        {
          localSaslClient = Sasl.createSaslClient(paramArrayOfString, paramString2, this.name, this.host, this.props, local1);
          if (localSaslClient == null)
          {
            if (this.debug)
              this.out.println("IMAP SASL DEBUG: No SASL support");
            return false;
            this.out.print(" " + paramArrayOfString[j]);
            j++;
          }
        }
        catch (SaslException localSaslException)
        {
          if (this.debug)
            this.out.println("IMAP SASL DEBUG: Failed to create SASL client: " + localSaslException);
          return false;
        }
        if (this.debug)
          this.out.println("IMAP SASL DEBUG: SASL client " + localSaslClient.getMechanismName());
        OutputStream localOutputStream;
        ByteArrayOutputStream localByteArrayOutputStream;
        byte[] arrayOfByte1;
        boolean bool;
        try
        {
          str1 = this.pr.writeCommand("AUTHENTICATE " + localSaslClient.getMechanismName(), null);
          localOutputStream = this.pr.getIMAPOutputStream();
          localByteArrayOutputStream = new ByteArrayOutputStream();
          arrayOfByte1 = new byte[] { 13, 10 };
          bool = localSaslClient.getMechanismName().equals("XGWTRUSTEDAPP");
          if (i != 0)
          {
            if (!localSaslClient.isComplete())
              break;
            String str2 = (String)localSaslClient.getNegotiatedProperty("javax.security.sasl.qop");
            if ((str2 == null) || ((!str2.equalsIgnoreCase("auth-int")) && (!str2.equalsIgnoreCase("auth-conf"))))
              break;
            if (this.debug)
              this.out.println("IMAP SASL DEBUG: Mechanism requires integrity or confidentiality");
            return false;
          }
        }
        catch (Exception localException1)
        {
          if (this.debug)
            this.out.println("IMAP SASL DEBUG: AUTHENTICATE Exception: " + localException1);
          return false;
        }
        byte[] arrayOfByte2;
        try
        {
          localObject1 = this.pr.readResponse();
          if (!((Response)localObject1).isContinuation())
            break label709;
          arrayOfByte2 = (byte[])null;
          if (!localSaslClient.isComplete())
          {
            byte[] arrayOfByte4 = ((Response)localObject1).readByteArray().getNewBytes();
            if (arrayOfByte4.length > 0)
              arrayOfByte4 = BASE64DecoderStream.decode(arrayOfByte4);
            if (this.debug)
              this.out.println("IMAP SASL DEBUG: challenge: " + ASCIIUtility.toString(arrayOfByte4, 0, arrayOfByte4.length) + " :");
            arrayOfByte2 = localSaslClient.evaluateChallenge(arrayOfByte4);
          }
          if (arrayOfByte2 != null)
            continue;
          if (this.debug)
            this.out.println("IMAP SASL DEBUG: no response");
          localOutputStream.write(arrayOfByte1);
          localOutputStream.flush();
          localByteArrayOutputStream.reset();
        }
        catch (Exception localException2)
        {
          if (this.debug)
            localException2.printStackTrace();
          Response localResponse = Response.byeResponse(localException2);
          localObject1 = localResponse;
          i = 1;
        }
        continue;
        if (this.debug)
          this.out.println("IMAP SASL DEBUG: response: " + ASCIIUtility.toString(arrayOfByte2, 0, arrayOfByte2.length) + " :");
        byte[] arrayOfByte3 = BASE64EncoderStream.encode(arrayOfByte2);
        if (bool)
          localByteArrayOutputStream.write("XGWTRUSTEDAPP ".getBytes());
        localByteArrayOutputStream.write(arrayOfByte3);
        localByteArrayOutputStream.write(arrayOfByte1);
        localOutputStream.write(localByteArrayOutputStream.toByteArray());
        localOutputStream.flush();
        localByteArrayOutputStream.reset();
      }
      label709: if ((((Response)localObject1).isTagged()) && (((Response)localObject1).getTag().equals(str1)))
        i = 1;
      else if (((Response)localObject1).isBYE())
        i = 1;
      else
        localVector.addElement(localObject1);
    }
    Response[] arrayOfResponse = new Response[localVector.size()];
    localVector.copyInto(arrayOfResponse);
    this.pr.notifyResponseHandlers(arrayOfResponse);
    this.pr.handleResult((Response)localObject1);
    this.pr.setCapabilities((Response)localObject1);
    return true;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.IMAPSaslAuthenticator
 * JD-Core Version:    0.6.2
 */