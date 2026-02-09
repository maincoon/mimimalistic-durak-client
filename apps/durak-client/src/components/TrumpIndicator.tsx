type Props = {
    suit?: string;
};

export function TrumpIndicator({ suit }: Props) {
    return (
        <div className="trump">
            <span>Trump</span>
            {suit ? (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '4px auto 0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    <img
                        src={`/cards/suit-${suit}.svg`}
                        alt={suit}
                        style={{ width: '20px', height: '20px' }}
                    />
                </div>
            ) : (
                <strong>-</strong>
            )}
        </div>
    );
}
