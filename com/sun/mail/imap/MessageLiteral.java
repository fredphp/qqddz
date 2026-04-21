package com.sun.mail.imap;

import com.sun.mail.iap.Literal;
import com.sun.mail.util.CRLFOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import javax.mail.Message;
import javax.mail.MessagingException;

class MessageLiteral
  implements Literal
{
  private byte[] buf;
  private Message msg;
  private int msgSize = -1;

  public MessageLiteral(Message paramMessage, int paramInt)
    throws MessagingException, IOException
  {
    this.msg = paramMessage;
    LengthCounter localLengthCounter = new LengthCounter(paramInt);
    CRLFOutputStream localCRLFOutputStream = new CRLFOutputStream(localLengthCounter);
    paramMessage.writeTo(localCRLFOutputStream);
    localCRLFOutputStream.flush();
    this.msgSize = localLengthCounter.getSize();
    this.buf = localLengthCounter.getBytes();
  }

  public int size()
  {
    return this.msgSize;
  }

  // ERROR //
  public void writeTo(OutputStream paramOutputStream)
    throws IOException
  {
    // Byte code:
    //   0: aload_0
    //   1: getfield 55	com/sun/mail/imap/MessageLiteral:buf	[B
    //   4: ifnull +17 -> 21
    //   7: aload_1
    //   8: aload_0
    //   9: getfield 55	com/sun/mail/imap/MessageLiteral:buf	[B
    //   12: iconst_0
    //   13: aload_0
    //   14: getfield 23	com/sun/mail/imap/MessageLiteral:msgSize	I
    //   17: invokevirtual 60	java/io/OutputStream:write	([BII)V
    //   20: return
    //   21: new 32	com/sun/mail/util/CRLFOutputStream
    //   24: dup
    //   25: aload_1
    //   26: invokespecial 35	com/sun/mail/util/CRLFOutputStream:<init>	(Ljava/io/OutputStream;)V
    //   29: astore_3
    //   30: aload_0
    //   31: getfield 25	com/sun/mail/imap/MessageLiteral:msg	Ljavax/mail/Message;
    //   34: aload_3
    //   35: invokevirtual 40	javax/mail/Message:writeTo	(Ljava/io/OutputStream;)V
    //   38: return
    //   39: astore_2
    //   40: new 18	java/io/IOException
    //   43: dup
    //   44: new 62	java/lang/StringBuilder
    //   47: dup
    //   48: ldc 64
    //   50: invokespecial 67	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   53: aload_2
    //   54: invokevirtual 71	java/lang/StringBuilder:append	(Ljava/lang/Object;)Ljava/lang/StringBuilder;
    //   57: invokevirtual 75	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   60: invokespecial 76	java/io/IOException:<init>	(Ljava/lang/String;)V
    //   63: athrow
    //   64: astore_2
    //   65: goto -25 -> 40
    //
    // Exception table:
    //   from	to	target	type
    //   0	20	39	javax/mail/MessagingException
    //   21	30	39	javax/mail/MessagingException
    //   30	38	64	javax/mail/MessagingException
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.MessageLiteral
 * JD-Core Version:    0.6.2
 */