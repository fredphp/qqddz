package com.sun.mail.iap;

import com.sun.mail.util.SocketFetcher;
import com.sun.mail.util.TraceInputStream;
import com.sun.mail.util.TraceOutputStream;
import java.io.BufferedOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.net.Socket;
import java.util.Properties;
import java.util.Vector;

public class Protocol
{
  private static final byte[] CRLF = { 13, 10 };
  private boolean connected = false;
  protected boolean debug;
  private volatile Vector handlers = null;
  protected String host;
  private volatile ResponseInputStream input;
  protected PrintStream out;
  private volatile DataOutputStream output;
  protected String prefix;
  protected Properties props;
  protected boolean quote;
  private Socket socket;
  private int tagCounter = 0;
  private volatile long timestamp;
  private TraceInputStream traceInput;
  private TraceOutputStream traceOutput;

  public Protocol(InputStream paramInputStream, OutputStream paramOutputStream, boolean paramBoolean)
    throws IOException
  {
    this.host = "localhost";
    this.debug = paramBoolean;
    this.quote = false;
    this.out = System.out;
    this.traceInput = new TraceInputStream(paramInputStream, System.out);
    this.traceInput.setTrace(paramBoolean);
    this.traceInput.setQuote(this.quote);
    this.input = new ResponseInputStream(this.traceInput);
    this.traceOutput = new TraceOutputStream(paramOutputStream, System.out);
    this.traceOutput.setTrace(paramBoolean);
    this.traceOutput.setQuote(this.quote);
    this.output = new DataOutputStream(new BufferedOutputStream(this.traceOutput));
    this.timestamp = System.currentTimeMillis();
  }

  public Protocol(String paramString1, int paramInt, boolean paramBoolean1, PrintStream paramPrintStream, Properties paramProperties, String paramString2, boolean paramBoolean2)
    throws IOException, ProtocolException
  {
    try
    {
      this.host = paramString1;
      this.debug = paramBoolean1;
      this.out = paramPrintStream;
      this.props = paramProperties;
      this.prefix = paramString2;
      this.socket = SocketFetcher.getSocket(paramString1, paramInt, paramProperties, paramString2, paramBoolean2);
      String str = paramProperties.getProperty("mail.debug.quote");
      if ((str != null) && (str.equalsIgnoreCase("true")));
      while (true)
      {
        this.quote = bool;
        initStreams(paramPrintStream);
        processGreeting(readResponse());
        this.timestamp = System.currentTimeMillis();
        this.connected = true;
        return;
        bool = false;
      }
    }
    finally
    {
      if (!this.connected)
        disconnect();
    }
  }

  private void initStreams(PrintStream paramPrintStream)
    throws IOException
  {
    this.traceInput = new TraceInputStream(this.socket.getInputStream(), paramPrintStream);
    this.traceInput.setTrace(this.debug);
    this.traceInput.setQuote(this.quote);
    this.input = new ResponseInputStream(this.traceInput);
    this.traceOutput = new TraceOutputStream(this.socket.getOutputStream(), paramPrintStream);
    this.traceOutput.setTrace(this.debug);
    this.traceOutput.setQuote(this.quote);
    this.output = new DataOutputStream(new BufferedOutputStream(this.traceOutput));
  }

  public void addResponseHandler(ResponseHandler paramResponseHandler)
  {
    try
    {
      if (this.handlers == null)
        this.handlers = new Vector();
      this.handlers.addElement(paramResponseHandler);
      return;
    }
    finally
    {
    }
  }

  public Response[] command(String paramString, Argument paramArgument)
  {
    try
    {
      Vector localVector = new Vector();
      int i = 0;
      try
      {
        String str2 = writeCommand(paramString, paramArgument);
        str1 = str2;
        if (i != 0)
        {
          Response[] arrayOfResponse = new Response[localVector.size()];
          localVector.copyInto(arrayOfResponse);
          this.timestamp = System.currentTimeMillis();
          return arrayOfResponse;
        }
      }
      catch (LiteralException localLiteralException)
      {
        while (true)
        {
          localVector.addElement(localLiteralException.getResponse());
          i = 1;
          str1 = null;
        }
      }
      catch (Exception localException)
      {
        while (true)
        {
          localVector.addElement(Response.byeResponse(localException));
          i = 1;
          String str1 = null;
          continue;
          try
          {
            Response localResponse2 = readResponse();
            localObject2 = localResponse2;
            localVector.addElement(localObject2);
            if (((Response)localObject2).isBYE())
              i = 1;
            if ((((Response)localObject2).isTagged()) && (((Response)localObject2).getTag().equals(str1)))
              i = 1;
          }
          catch (IOException localIOException)
          {
            while (true)
            {
              Response localResponse1 = Response.byeResponse(localIOException);
              Object localObject2 = localResponse1;
            }
          }
          catch (ProtocolException localProtocolException)
          {
          }
        }
      }
    }
    finally
    {
    }
  }

  // ERROR //
  protected void disconnect()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 125	com/sun/mail/iap/Protocol:socket	Ljava/net/Socket;
    //   6: astore_2
    //   7: aload_2
    //   8: ifnull +15 -> 23
    //   11: aload_0
    //   12: getfield 125	com/sun/mail/iap/Protocol:socket	Ljava/net/Socket;
    //   15: invokevirtual 220	java/net/Socket:close	()V
    //   18: aload_0
    //   19: aconst_null
    //   20: putfield 125	com/sun/mail/iap/Protocol:socket	Ljava/net/Socket;
    //   23: aload_0
    //   24: monitorexit
    //   25: return
    //   26: astore_1
    //   27: aload_0
    //   28: monitorexit
    //   29: aload_1
    //   30: athrow
    //   31: astore_3
    //   32: goto -14 -> 18
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	26	finally
    //   11	18	26	finally
    //   18	23	26	finally
    //   11	18	31	java/io/IOException
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    disconnect();
  }

  protected ResponseInputStream getInputStream()
  {
    return this.input;
  }

  protected OutputStream getOutputStream()
  {
    return this.output;
  }

  protected ByteArray getResponseBuffer()
  {
    return null;
  }

  public long getTimestamp()
  {
    return this.timestamp;
  }

  public void handleResult(Response paramResponse)
    throws ProtocolException
  {
    if (paramResponse.isOK());
    do
    {
      return;
      if (paramResponse.isNO())
        throw new CommandFailedException(paramResponse);
      if (paramResponse.isBAD())
        throw new BadCommandException(paramResponse);
    }
    while (!paramResponse.isBYE());
    disconnect();
    throw new ConnectionException(this, paramResponse);
  }

  public void notifyResponseHandlers(Response[] paramArrayOfResponse)
  {
    if (this.handlers == null)
      return;
    int i = 0;
    label10: Response localResponse;
    if (i < paramArrayOfResponse.length)
    {
      localResponse = paramArrayOfResponse[i];
      if (localResponse != null)
        break label30;
    }
    while (true)
    {
      i++;
      break label10;
      break;
      label30: int j = this.handlers.size();
      if (j == 0)
        break;
      Object[] arrayOfObject = new Object[j];
      this.handlers.copyInto(arrayOfObject);
      for (int k = 0; k < j; k++)
        ((ResponseHandler)arrayOfObject[k]).handleResponse(localResponse);
    }
  }

  protected void processGreeting(Response paramResponse)
    throws ProtocolException
  {
    if (paramResponse.isBYE())
      throw new ConnectionException(this, paramResponse);
  }

  public Response readResponse()
    throws IOException, ProtocolException
  {
    return new Response(this);
  }

  public void removeResponseHandler(ResponseHandler paramResponseHandler)
  {
    try
    {
      if (this.handlers != null)
        this.handlers.removeElement(paramResponseHandler);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void simpleCommand(String paramString, Argument paramArgument)
    throws ProtocolException
  {
    Response[] arrayOfResponse = command(paramString, paramArgument);
    notifyResponseHandlers(arrayOfResponse);
    handleResult(arrayOfResponse[(-1 + arrayOfResponse.length)]);
  }

  public void startTLS(String paramString)
    throws IOException, ProtocolException
  {
    try
    {
      simpleCommand(paramString, null);
      this.socket = SocketFetcher.startTLS(this.socket, this.props, this.prefix);
      initStreams(this.out);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected boolean supportsNonSyncLiterals()
  {
    return false;
  }

  public String writeCommand(String paramString, Argument paramArgument)
    throws IOException, ProtocolException
  {
    StringBuilder localStringBuilder = new StringBuilder("A");
    int i = this.tagCounter;
    this.tagCounter = (i + 1);
    String str = Integer.toString(i, 10);
    this.output.writeBytes(str + " " + paramString);
    if (paramArgument != null)
    {
      this.output.write(32);
      paramArgument.write(this);
    }
    this.output.write(CRLF);
    this.output.flush();
    return str;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.Protocol
 * JD-Core Version:    0.6.2
 */